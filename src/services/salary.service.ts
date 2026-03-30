import redis from '../config/redis';
import scraperOrchestrator from '../scrapers/orchestrator';
import aiService from './ai.service';
import { SalaryBenchmark, SalaryComparison, SalaryEvaluationResponse } from '../types/salary.types';
import { formatCurrency } from '../utils/formatting';
import { getCostOfLivingIndex, adjustSalaryForCOL } from '../utils/colIndex';

class SalaryService {
  private async getCacheKey(query: any): Promise<string> {
    return `salary:${JSON.stringify(query)}`;
  }

  async getSalaryBenchmark(query: any): Promise<SalaryBenchmark> {
    const cacheKey = await this.getCacheKey(query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const rawData = await scraperOrchestrator.scrapeSalaryData(query.job_title, query.location);
    const synthesizedData = await aiService.synthesizeSalaryData(rawData);
    
    const benchmark = await this.enrichSalaryData(synthesizedData, query);
    
    await redis.set(cacheKey, JSON.stringify(benchmark), 'EX', 24 * 60 * 60);
    
    return benchmark;
  }

  async getSalaryComparison(query: any): Promise<SalaryComparison> {
    const locations = query.locations.split(',').map((l: string) => l.trim());
    
    const benchmarks = await Promise.all(
      locations.map(async (location: string) => {
        const locationQuery = { ...query, location };
        const cacheKey = await this.getCacheKey(locationQuery);
        const cached = await redis.get(cacheKey);
        
        if (cached) {
          return JSON.parse(cached);
        }
        
        const rawData = await scraperOrchestrator.scrapeSalaryData(query.job_title, location);
        const synthesizedData = await aiService.synthesizeSalaryData(rawData);
        const benchmark = await this.enrichSalaryData(synthesizedData, locationQuery);
        
        await redis.set(cacheKey, JSON.stringify(benchmark), 'EX', 24 * 60 * 60);
        
        return benchmark;
      })
    );

    return this.formatComparison(benchmarks, query);
  }

  async evaluateSalaryOffer(data: any): Promise<SalaryEvaluationResponse> {
    const benchmark = await this.getSalaryBenchmark({
      job_title: data.job_title,
      location: data.location,
      experience_level: this.getExperienceLevelFromYears(data.experience_years),
      skills: data.skills.join(','),
      industry: data.industry,
      company_size: this.getCompanySizeFromStage(data.company_stage),
      include_equity: !!data.offered_equity,
      currency: data.currency,
    });

    return aiService.evaluateSalaryOffer({
      ...data,
      market_benchmark: benchmark,
    });
  }

  private async enrichSalaryData(data: any, query: any): Promise<SalaryBenchmark> {
    const hourlyEquivalent = {
      median: (data.salary?.median / 2080).toFixed(2),
      p25: (data.salary?.p25 / 2080).toFixed(2),
      p75: (data.salary?.p75 / 2080).toFixed(2),
    };

    return {
      query: {
        job_title_input: query.job_title,
        job_title_normalised: data.job_title_normalised || query.job_title,
        location: query.location,
        location_type: this.determineLocationType(query.location),
        experience_level: query.experience_level,
        currency: query.currency || 'USD',
      },
      salary: {
        currency: query.currency || 'USD',
        period: 'annual',
        base: data.salary || { min: 0, p25: 0, median: 0, mean: 0, p75: 0, max: 0 },
        formatted: {
          min: formatCurrency(data.salary?.min || 0, query.currency),
          p25: formatCurrency(data.salary?.p25 || 0, query.currency),
          median: formatCurrency(data.salary?.median || 0, query.currency),
          mean: formatCurrency(data.salary?.mean || 0, query.currency),
          p75: formatCurrency(data.salary?.p75 || 0, query.currency),
          max: formatCurrency(data.salary?.max || 0, query.currency),
        },
        hourly_equivalent: {
          median: formatCurrency(parseFloat(hourlyEquivalent.median), query.currency),
          p25: formatCurrency(parseFloat(hourlyEquivalent.p25), query.currency),
          p75: formatCurrency(parseFloat(hourlyEquivalent.p75), query.currency),
        },
      },
      total_compensation: data.total_compensation,
      location_context: {
        cost_of_living_index: getCostOfLivingIndex(query.location),
        salary_vs_national_median_pct: 0,
        remote_salary_comparison: {
          national_remote_median: 0,
          sf_premium_pct: 0,
          note: '',
        },
      },
      market_context: data.market_context || {},
      skills_premium: data.skills_premium || [],
      company_type_breakdown: data.company_type_breakdown || {},
      confidence: data.confidence || 'medium',
      sample_size_estimate: data.sample_size_estimate || 'Unknown',
      data_sources: data.data_sources || ['Default Data'],
      methodology_note: 'Salary ranges synthesized from multiple public sources and normalized by AI.',
      last_refreshed: new Date().toISOString(),
    };
  }

  private formatComparison(benchmarks: SalaryBenchmark[], query: any): SalaryComparison {
    const comparison = benchmarks.map((benchmark, index) => {
      const colIndex = getCostOfLivingIndex(benchmark.query.location);
      const purchasingPower = adjustSalaryForCOL(benchmark.salary.base.median, benchmark.query.location);

      return {
        location: benchmark.query.location,
        median_salary: benchmark.salary.base.median,
        formatted: formatCurrency(benchmark.salary.base.median, query.currency),
        cost_of_living_index: colIndex,
        purchasing_power_adjusted: purchasingPower,
        rank: index + 1,
        vs_national_avg_pct: 0,
      };
    }).sort((a, b) => b.median_salary - a.median_salary);

    const adjustedComparison = comparison.sort((a, b) => b.purchasing_power_adjusted! - a.purchasing_power_adjusted!);
    
    comparison.forEach((item, index) => {
      item.rank = index + 1;
    });

    const highestNominal = comparison[0];
    const highestAdjusted = adjustedComparison[0];

    return {
      job_title: query.job_title,
      experience_level: query.experience_level,
      currency: query.currency,
      comparison,
      insight: `The highest nominal salary is in ${highestNominal.location} at ${highestNominal.formatted}, but the highest purchasing power adjusted salary is in ${highestAdjusted.location} at ${formatCurrency(highestAdjusted.purchasing_power_adjusted!, query.currency)}.`,
      highest_nominal: `${highestNominal.location} — ${highestNominal.formatted}`,
      highest_adjusted: `${highestAdjusted.location} — ${formatCurrency(highestAdjusted.purchasing_power_adjusted!, query.currency)} purchasing power equivalent`,
    };
  }

  private determineLocationType(location: string): string {
    const lowerLoc = location.toLowerCase();
    
    if (lowerLoc.includes('remote') || lowerLoc.includes('anywhere')) {
      return 'remote';
    }
    
    const countryPatterns = [
      'united states', 'usa', 'uk', 'united kingdom', 'canada', 'australia', 'germany',
      'france', 'japan', 'china', 'india', 'brazil', 'russia', 'south africa', 'nigeria',
      'egypt', 'mexico', 'argentina', 'colombia', 'spain', 'italy', 'netherlands', 'belgium'
    ];
    
    if (countryPatterns.some(country => lowerLoc.includes(country))) {
      return 'country';
    }
    
    const majorCities = [
      'new york', 'san francisco', 'london', 'berlin', 'tokyo', 'singapore', 'hong kong',
      'paris', 'sydney', 'toronto', 'dubai', 'mumbai', 'bangalore', 'shanghai', 'beijing',
      'dallas', 'austin', 'chicago', 'seattle', 'los angeles', 'boston', 'washington dc'
    ];
    
    if (majorCities.some(city => lowerLoc.includes(city))) {
      return 'city';
    }
    
    return 'global';
  }

  private getExperienceLevelFromYears(years: number): string {
    if (years < 2) return 'entry';
    if (years < 5) return 'mid';
    if (years < 8) return 'senior';
    if (years < 12) return 'lead';
    return 'principal';
  }

  private getCompanySizeFromStage(stage: string): string {
    const normalizedStage = stage.toLowerCase();
    
    if (normalizedStage.includes('seed') || normalizedStage.includes('series a')) {
      return 'startup';
    }
    if (normalizedStage.includes('series b') || normalizedStage.includes('series c') || normalizedStage.includes('series d')) {
      return 'scaleup';
    }
    return 'enterprise';
  }
}

export default new SalaryService();