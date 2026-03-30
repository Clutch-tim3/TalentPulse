import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

interface GlassdoorSalary {
  jobTitle: string;
  location: string;
  experienceLevel: string;
  company: string;
  baseSalary: number;
  bonus: number;
  totalComp: number;
  salaryRange: string;
  sampleSize: number;
  postedDate: string;
}

class GlassdoorScraper {
  private minDelay = parseInt(process.env.SCRAPING_MIN_DELAY_MS || '2000');
  private maxDelay = parseInt(process.env.SCRAPING_MAX_DELAY_MS || '5000');

  private async delay(): Promise<void> {
    const delayTime = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }

  async getSalaryData(jobTitle: string, location: string): Promise<GlassdoorSalary[]> {
    const browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      const formattedTitle = jobTitle.toLowerCase().replace(/\s+/g, '-');
      const salaryUrl = `https://www.glassdoor.com/Salaries/${formattedTitle}-Salaries-*.htm`;

      await page.goto(salaryUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.delay();

      const salaries: GlassdoorSalary[] = [];
      const salaryElements = await page.$$('.salary-entry');

      for (const el of salaryElements) {
        try {
          const salary = await this.extractSalaryDetails(page, el);
          if (salary) {
            salaries.push(salary);
          }
        } catch (error) {
          console.error('Failed to extract salary details:', error);
        }
      }

      return salaries.filter(salary => this.isRelevantLocation(salary.location, location));
    } catch (error) {
      console.error('Glassdoor salary scrape failed:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private async extractSalaryDetails(_page: any, element: any): Promise<GlassdoorSalary | null> {
    try {
      const jobTitle = await element.$eval('.salary-job-title', (el: any) => el.textContent?.trim() || '');
      const location = await element.$eval('.salary-location', (el: any) => el.textContent?.trim() || '');
      const experienceLevel = await element.$eval('.salary-experience', (el: any) => el.textContent?.trim() || '');
      const company = await element.$eval('.salary-company', (el: any) => el.textContent?.trim() || '');
      const baseSalaryText = await element.$eval('.salary-base', (el: any) => el.textContent || '');
      const bonusText = await element.$eval('.salary-bonus', (el: any) => el.textContent || '');
      const totalCompText = await element.$eval('.salary-total', (el: any) => el.textContent || '');
      const salaryRange = await element.$eval('.salary-range', (el: any) => el.textContent?.trim() || '');
      const sampleSize = parseInt(await element.$eval('.salary-sample-size', (el: any) => el.textContent?.match(/\d+/)?.[0] || '0'));
      const postedDate = await element.$eval('.salary-posted-date', (el: any) => el.textContent?.trim() || '');

      return {
        jobTitle,
        location,
        experienceLevel,
        company,
        baseSalary: this.parseSalary(baseSalaryText),
        bonus: this.parseSalary(bonusText),
        totalComp: this.parseSalary(totalCompText),
        salaryRange,
        sampleSize,
        postedDate,
      };
    } catch (error) {
      console.error('Failed to extract salary details from element:', error);
      return null;
    }
  }

  private parseSalary(text: string): number {
    const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
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

export default new GlassdoorScraper();