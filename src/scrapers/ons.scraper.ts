import axios from 'axios';

interface ONSResponse {
  years: Array<{
    year: string;
    estimates: Array<{
      name: string;
      value: number;
    }>;
  }>;
}

interface ONSSalaryData {
  year: string;
  median: number;
  mean: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  sampleSize: number;
}

class ONSScraper {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.ons.gov.uk';

  constructor() {
    this.apiKey = process.env.ONS_API_KEY;
  }

  async getSalaryData(occupationName: string, _location: string): Promise<ONSSalaryData[]> {
    if (!this.apiKey) {
      console.warn('ONS API key not configured, skipping ONS data');
      return [];
    }

    const occupationCode = this.mapOccupationToCode(occupationName);
    if (!occupationCode) {
      return [];
    }

    const query = `
      SELECT "Date", "Value"
      FROM "ASHE:Annual Survey of Hours and Earnings"
      WHERE "Occupation" = '${occupationCode}'
        AND "Measure" IN ('Median', 'Mean', 'Percentile 10', 'Percentile 25', 'Percentile 75', 'Percentile 90')
        AND "Unit" = 'GBP'
      ORDER BY "Date" DESC
      LIMIT 24
    `;

    try {
      const response = await axios.get<ONSResponse>(`${this.baseUrl}/dataset/ASHE/timeseries`, {
        params: {
          q: query,
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      return this.parseResponse(response.data);
    } catch (error) {
      console.error('ONS scraper error:', error);
      return [];
    }
  }

  private parseResponse(data: ONSResponse): ONSSalaryData[] {
    const results: ONSSalaryData[] = [];

    for (const yearData of data.years) {
      const salaryData: ONSSalaryData = {
        year: yearData.year,
        median: 0,
        mean: 0,
        p10: 0,
        p25: 0,
        p75: 0,
        p90: 0,
        sampleSize: 0,
      };

      for (const estimate of yearData.estimates) {
        const value = estimate.value;
        
        if (estimate.name === 'Median') {
          salaryData.median = value;
        } else if (estimate.name === 'Mean') {
          salaryData.mean = value;
        } else if (estimate.name === 'Percentile 10') {
          salaryData.p10 = value;
        } else if (estimate.name === 'Percentile 25') {
          salaryData.p25 = value;
        } else if (estimate.name === 'Percentile 75') {
          salaryData.p75 = value;
        } else if (estimate.name === 'Percentile 90') {
          salaryData.p90 = value;
        }
      }

      results.push(salaryData);
    }

    return results;
  }

  private mapOccupationToCode(occupationName: string): string {
    const mappings: Record<string, string> = {
      'software engineer': 'IT and Telecommunications Professionals',
      'software developer': 'IT and Telecommunications Professionals',
      'frontend developer': 'IT and Telecommunications Professionals',
      'backend developer': 'IT and Telecommunications Professionals',
      'full stack developer': 'IT and Telecommunications Professionals',
      'data engineer': 'IT and Telecommunications Professionals',
      'data scientist': 'IT and Telecommunications Professionals',
      'machine learning engineer': 'IT and Telecommunications Professionals',
      'ai engineer': 'IT and Telecommunications Professionals',
      'product manager': 'Business and Public Service Professionals',
      'project manager': 'Business and Public Service Professionals',
      'ux designer': 'Business and Public Service Professionals',
      'ui designer': 'Business and Public Service Professionals',
      'ux/ui designer': 'Business and Public Service Professionals',
      'marketing manager': 'Business and Public Service Professionals',
      'marketing specialist': 'Business and Public Service Professionals',
      'sales manager': 'Business and Public Service Professionals',
      'account executive': 'Business and Public Service Professionals',
      'hr manager': 'Business and Public Service Professionals',
      'hr specialist': 'Business and Public Service Professionals',
    };

    const normalizedName = occupationName.toLowerCase().trim();
    
    for (const [name, code] of Object.entries(mappings)) {
      if (normalizedName.includes(name)) {
        return code;
      }
    }

    return '';
  }
}

export default new ONSScraper();