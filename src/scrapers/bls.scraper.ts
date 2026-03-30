import axios from 'axios';

interface BLSResponse {
  status: string;
  message: string[];
  Results: {
    series: Array<{
      seriesID: string;
      data: Array<{
        year: string;
        period: string;
        value: string;
        footnotes: any[];
      }>;
    }>;
  };
}

interface BLSOccupationData {
  occupationCode: string;
  occupationName: string;
  medianSalary: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  employment: number;
}

class BLSScraper {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

  constructor() {
    this.apiKey = process.env.BLS_API_KEY;
  }

  async getOccupationData(occupationName: string, location: string): Promise<BLSOccupationData[]> {
    if (!this.apiKey) {
      console.warn('BLS API key not configured, skipping BLS data');
      return [];
    }

    const occupationCode = this.mapOccupationToCode(occupationName);
    if (!occupationCode) {
      return [];
    }

    const seriesId = `OEUN${location === 'Remote' ? '00000' : '00001'}${occupationCode}`;

    try {
      const response = await axios.get<BLSResponse>(this.baseUrl, {
        params: {
          registrationkey: this.apiKey,
          seriesid: [seriesId],
          startyear: new Date().getFullYear() - 1,
          endyear: new Date().getFullYear(),
        },
        timeout: 10000,
      });

      if (response.data.status !== 'REQUEST_SUCCEEDED') {
        console.warn('BLS API request failed:', response.data.message);
        return [];
      }

      const series = response.data.Results.series[0];
      const latestYearData = series.data.filter(d => d.period === 'A');
      
      if (latestYearData.length === 0) {
        return [];
      }

      const annualData = latestYearData.reduce((prev, current) => 
        parseInt(current.year) > parseInt(prev.year) ? current : prev
      );

      return [{
        occupationCode,
        occupationName,
        medianSalary: parseInt(annualData.value) * 1000,
        p10: 0,
        p25: 0,
        p75: 0,
        p90: 0,
        employment: 0,
      }];
    } catch (error) {
      console.error('BLS scraper error:', error);
      return [];
    }
  }

  private mapOccupationToCode(occupationName: string): string {
    const mappings: Record<string, string> = {
      'software engineer': '151132',
      'software developer': '151132',
      'frontend developer': '151134',
      'backend developer': '151134',
      'full stack developer': '151132',
      'data engineer': '152022',
      'data scientist': '152022',
      'machine learning engineer': '152022',
      'ai engineer': '152022',
      'product manager': '112021',
      'project manager': '111021',
      'ux designer': '151124',
      'ui designer': '151124',
      'ux/ui designer': '151124',
      'marketing manager': '112021',
      'marketing specialist': '112021',
      'sales manager': '112021',
      'account executive': '414000',
      'hr manager': '113041',
      'hr specialist': '132021',
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

export default new BLSScraper();