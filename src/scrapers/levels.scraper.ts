import axios from 'axios';
import * as cheerio from 'cheerio';

interface LevelsSalary {
  company: string;
  level: string;
  title: string;
  baseSalary: number;
  stock: number;
  bonus: number;
  totalComp: number;
  location: string;
  yearsExperience: number;
  timestamp: string;
}

class LevelsScraper {
  async getSalaryData(jobTitle: string, location: string): Promise<LevelsSalary[]> {
    try {
      const formattedTitle = jobTitle.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.levels.fyi/t/${formattedTitle}/`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
      });

      const $ = cheerio.load(response.data);
      const salaries: LevelsSalary[] = [];

      $('[data-testid="salary-row"]').each((_index: number, element: any) => {
        const salary = this.extractSalaryFromRow($, $(element));
        if (salary) {
          salaries.push(salary);
        }
      });

      return salaries.filter(salary => this.isRelevantLocation(salary.location, location));
    } catch (error) {
      console.error('Levels.fyi scraper error:', error);
      return [];
    }
  }

  private extractSalaryFromRow(_$: any, row: any): LevelsSalary | null {
    try {
      const company = row.find('[data-testid="company-name"]').text().trim();
      const level = row.find('[data-testid="level-name"]').text().trim();
      const title = row.find('[data-testid="job-title"]').text().trim();
      const baseSalary = parseInt(row.find('[data-testid="base-salary"]').text().replace(/[$,]/g, ''));
      const stock = parseInt(row.find('[data-testid="stock"]').text().replace(/[$,]/g, ''));
      const bonus = parseInt(row.find('[data-testid="bonus"]').text().replace(/[$,]/g, ''));
      const totalComp = baseSalary + stock + bonus;
      const location = row.find('[data-testid="location"]').text().trim();
      const yearsExperience = parseFloat(row.find('[data-testid="years-experience"]').text());
      const timestamp = row.find('[data-testid="timestamp"]').text().trim();

      return {
        company,
        level,
        title,
        baseSalary,
        stock,
        bonus,
        totalComp,
        location,
        yearsExperience,
        timestamp,
      };
    } catch (error) {
      console.error('Failed to extract salary from row:', error);
      return null;
    }
  }

  private isRelevantLocation(jobLocation: string, searchLocation: string): boolean {
    const normalizedJobLocation = jobLocation.toLowerCase().trim();
    const normalizedSearchLocation = searchLocation.toLowerCase().trim();

    if (normalizedSearchLocation === 'remote') {
      return normalizedJobLocation.includes('remote') || normalizedJobLocation.includes('anywhere');
    }

    if (normalizedJobLocation.includes(normalizedSearchLocation) || 
        normalizedSearchLocation.includes(normalizedJobLocation)) {
      return true;
    }

    const locationMap: Record<string, string[]> = {
      'san francisco': ['sf', 'bay area'],
      'new york': ['nyc', 'manhattan'],
      'austin': ['austin'],
      'london': ['london', 'uk'],
      'berlin': ['berlin', 'germany'],
      'dublin': ['dublin', 'ireland'],
      'singapore': ['singapore'],
      'remote': ['remote', 'anywhere'],
    };

    for (const [canonical, aliases] of Object.entries(locationMap)) {
      if (normalizedSearchLocation.includes(canonical) || 
          aliases.some(alias => normalizedSearchLocation.includes(alias))) {
        return normalizedJobLocation.includes(canonical) || 
               aliases.some(alias => normalizedJobLocation.includes(alias));
      }
    }

    return false;
  }
}

export default new LevelsScraper();