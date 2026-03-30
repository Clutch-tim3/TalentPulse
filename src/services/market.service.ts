import redis from '../config/redis';

class MarketService {
  private async getCacheKey(query: any): Promise<string> {
    return `market:${JSON.stringify(query)}`;
  }

  async getMarketOverview(query: any): Promise<any> {
    const cacheKey = await this.getCacheKey(query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const overview = this.generateMockMarketOverview(query);
    await redis.set(cacheKey, JSON.stringify(overview), 'EX', 12 * 60 * 60);
    
    return overview;
  }

  private generateMockMarketOverview(query: any): any {
    const sectors = {
      tech: {
        hiring_activity: 'High',
        top_growing_roles: [
          { role: 'AI Engineer', growth_pct: 120 },
          { role: 'Cloud Architect', growth_pct: 85 },
          { role: 'Data Scientist', growth_pct: 75 },
        ],
        declining_roles: [
          { role: 'Legacy Systems Engineer', decline_pct: -35 },
          { role: 'On-premise IT Specialist', decline_pct: -40 },
        ],
        salary_trends: {
          overall_increase_pct: 8.5,
          hot_skills_premium: [
            { skill: 'AI/ML', premium_pct: 25 },
            { skill: 'Cloud', premium_pct: 18 },
            { skill: 'Data Engineering', premium_pct: 15 },
          ],
          affordable_locations: [
            { city: 'Austin, TX', col_index: 121, median_salary: 135000 },
            { city: 'Denver, CO', col_index: 120, median_salary: 130000 },
            { city: 'Charlotte, NC', col_index: 90, median_salary: 110000 },
          ],
        },
      },
      finance: {
        hiring_activity: 'Moderate',
        top_growing_roles: [
          { role: 'Quantitative Analyst', growth_pct: 60 },
          { role: 'FinTech Product Manager', growth_pct: 55 },
          { role: 'Compliance Specialist', growth_pct: 45 },
        ],
        declining_roles: [
          { role: 'Traditional Bank Teller', decline_pct: -25 },
          { role: 'Manual Reconciliation Specialist', decline_pct: -30 },
        ],
        salary_trends: {
          overall_increase_pct: 5.2,
          hot_skills_premium: [
            { skill: 'Quantitative Analysis', premium_pct: 30 },
            { skill: 'FinTech', premium_pct: 22 },
            { skill: 'Regulatory Compliance', premium_pct: 18 },
          ],
          affordable_locations: [
            { city: 'Charlotte, NC', col_index: 90, median_salary: 105000 },
            { city: 'Columbus, OH', col_index: 85, median_salary: 100000 },
            { city: 'Phoenix, AZ', col_index: 103, median_salary: 110000 },
          ],
        },
      },
      healthcare: {
        hiring_activity: 'Very High',
        top_growing_roles: [
          { role: 'Healthcare Data Analyst', growth_pct: 95 },
          { role: 'Telemedicine Specialist', growth_pct: 80 },
          { role: 'Biomedical Engineer', growth_pct: 70 },
        ],
        declining_roles: [
          { role: 'Traditional Radiologist', decline_pct: -15 },
          { role: 'Manual Medical Coder', decline_pct: -20 },
        ],
        salary_trends: {
          overall_increase_pct: 6.8,
          hot_skills_premium: [
            { skill: 'Healthcare Data', premium_pct: 20 },
            { skill: 'Telemedicine', premium_pct: 18 },
            { skill: 'Biomedical Engineering', premium_pct: 15 },
          ],
          affordable_locations: [
            { city: 'Nashville, TN', col_index: 95, median_salary: 95000 },
            { city: 'Indianapolis, IN', col_index: 88, median_salary: 90000 },
            { city: 'Tampa, FL', col_index: 100, median_salary: 98000 },
          ],
        },
      },
      default: {
        hiring_activity: 'Moderate',
        top_growing_roles: [
          { role: 'Digital Marketing Specialist', growth_pct: 50 },
          { role: 'Remote Customer Success Manager', growth_pct: 45 },
          { role: 'Operations Analyst', growth_pct: 40 },
        ],
        declining_roles: [
          { role: 'Traditional Retail Sales', decline_pct: -25 },
          { role: 'Print Media Specialist', decline_pct: -30 },
        ],
        salary_trends: {
          overall_increase_pct: 4.5,
          hot_skills_premium: [
            { skill: 'Digital Marketing', premium_pct: 15 },
            { skill: 'Remote Collaboration', premium_pct: 12 },
            { skill: 'Data Analysis', premium_pct: 10 },
          ],
          affordable_locations: [
            { city: 'Austin, TX', col_index: 121, median_salary: 85000 },
            { city: 'Raleigh, NC', col_index: 95, median_salary: 80000 },
            { city: 'Birmingham, AL', col_index: 82, median_salary: 75000 },
          ],
        },
      },
    };

    const sectorData = sectors[query.sector as keyof typeof sectors] || sectors.default;

    return {
      generated_at: new Date().toISOString(),
      sector: query.sector,
      location: query.location,
      hiring_activity: {
        overall_level: sectorData.hiring_activity,
        trend: ['Increasing', 'Stable', 'Decreasing'][Math.floor(Math.random() * 3)],
        compared_to_last_month: `${Math.floor(Math.random() * 20) - 10}%`,
      },
      top_growing_roles: sectorData.top_growing_roles.map((role: any, index: number) => ({
        role: role.role,
        growth_pct: role.growth_pct,
        demand_level: ['Very High', 'High', 'Moderate'][index],
      })),
      declining_roles: sectorData.declining_roles.map((role: any, index: number) => ({
        role: role.role,
        decline_pct: role.decline_pct,
        reason: ['Automation', 'Changing market needs', 'Remote work adoption'][index],
      })),
      salary_trends: sectorData.salary_trends,
      leverage_balance: {
        current: this.getLeverageBalance(query),
        reason: this.getLeverageReason(query),
      },
      macro_signals: this.getMacroSignals(query),
    };
  }

  private getLeverageBalance(query: any): string {
    if (query.sector === 'tech') {
      return 'Candidate';
    } else if (query.sector === 'healthcare') {
      return 'Candidate';
    } else if (query.sector === 'finance') {
      return 'Balanced';
    }
    return 'Employer';
  }

  private getLeverageReason(query: any): string {
    if (query.sector === 'tech') {
      return 'High demand for skilled engineers with shortage of qualified candidates';
    } else if (query.sector === 'healthcare') {
      return 'Chronic staffing shortages due to aging population and pandemic burnout';
    } else if (query.sector === 'finance') {
      return 'Large talent pool with stable hiring needs';
    }
    return 'Adequate supply of candidates for most roles';
  }

  private getMacroSignals(_query: any): string[] {
    const signals = [
      'Remote work continues to be a standard offering for knowledge workers',
      'Skills in AI and cloud computing are in high demand across most industries',
      'Cost of living adjustments are becoming more common in hiring packages',
      'Companies are increasing focus on employee well-being and flexibility',
    ];

    return signals.slice(0, Math.floor(Math.random() * signals.length) + 2);
  }
}

export default new MarketService();