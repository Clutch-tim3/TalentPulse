import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

interface LinkedInJob {
  title: string;
  company: string;
  location: string;
  postedDate: string;
  description: string;
  skills: string[];
  url: string;
}

interface LinkedInSalary {
  jobTitle: string;
  location: string;
  experienceLevel: string;
  baseSalaryRange: {
    min: number;
    max: number;
  };
  medianSalary: number;
  additionalCompensation: string;
  sampleSize: number;
}

class LinkedInScraper {
  private minDelay = parseInt(process.env.SCRAPING_MIN_DELAY_MS || '2000');
  private maxDelay = parseInt(process.env.SCRAPING_MAX_DELAY_MS || '5000');

  private async delay(): Promise<void> {
    const delayTime = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }

  async searchJobs(title: string, location: string, limit: number = 20): Promise<LinkedInJob[]> {
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
      
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      await this.delay();

      const jobs: LinkedInJob[] = [];
      const jobLinks = await page.$$eval('.base-card__full-link', links => 
        links.map(link => link.getAttribute('href')).filter(Boolean) as string[]
      );

      for (let i = 0; i < Math.min(jobLinks.length, limit); i++) {
        const jobUrl = jobLinks[i];
        try {
          const job = await this.extractJobDetails(page, jobUrl);
          if (job) {
            jobs.push(job);
          }
        } catch (error) {
          console.error(`Failed to extract job details from ${jobUrl}:`, error);
        }
      }

      return jobs;
    } catch (error) {
      console.error('LinkedIn job search failed:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private async extractJobDetails(page: any, jobUrl: string): Promise<LinkedInJob | null> {
    try {
      await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.delay();

      const title = await page.$eval('.top-card-layout__title', (el: any) => el.textContent?.trim() || '');
      const company = await page.$eval('.topcard__org-name-link', (el: any) => el.textContent?.trim() || '');
      const location = await page.$eval('.topcard__flavor--bullet', (el: any) => el.textContent?.trim() || '');
      const postedDate = await page.$eval('.topcard__flavor--metadata posted-time-ago__text', (el: any) => el.textContent?.trim() || '');
      
      let description = '';
      try {
        description = await page.$eval('.description__text', (el: any) => el.textContent?.trim() || '');
      } catch (e) {
        console.error('Failed to extract job description:', e);
      }

      const skills: string[] = [];
      try {
        const skillsElements = await page.$$('.description__job-criteria-item--text');
        for (const el of skillsElements) {
          const text = await el.evaluate((node: any) => node.textContent?.trim() || '');
          if (text) {
            skills.push(text);
          }
        }
      } catch (e) {
        console.error('Failed to extract skills:', e);
      }

      return {
        title,
        company,
        location,
        postedDate,
        description,
        skills,
        url: jobUrl,
      };
    } catch (error) {
      console.error('Failed to extract job details:', error);
      return null;
    }
  }

  async getSalaryData(jobTitle: string, location: string): Promise<LinkedInSalary[]> {
    const browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      const salaryUrl = `https://www.linkedin.com/salary/${encodeURIComponent(jobTitle)}-salary-${encodeURIComponent(location)}`;
      await page.goto(salaryUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      await this.delay();

      const salaries: LinkedInSalary[] = [];
      
      const salaryElements = await page.$$('.salary-details__item');
      for (const el of salaryElements) {
        try {
          const salary = await this.extractSalaryDetails(el);
          if (salary) {
            salaries.push(salary);
          }
        } catch (error) {
          console.error('Failed to extract salary details:', error);
        }
      }

      return salaries;
    } catch (error) {
      console.error('LinkedIn salary scrape failed:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private async extractSalaryDetails(element: any): Promise<LinkedInSalary | null> {
    try {
      const title = await element.$eval('.salary-details__job-title', (el: any) => el.textContent?.trim() || '');
      const location = await element.$eval('.salary-details__location', (el: any) => el.textContent?.trim() || '');
      const experienceLevel = await element.$eval('.salary-details__experience-level', (el: any) => el.textContent?.trim() || '');
      
      const salaryText = await element.$eval('.salary-details__base-pay', (el: any) => el.textContent || '');
      const match = salaryText.match(/(\d{1,3}(?:,\d{3})*) - (\d{1,3}(?:,\d{3})*)/);
      
      if (!match) {
        return null;
      }

      return {
        jobTitle: title,
        location,
        experienceLevel,
        baseSalaryRange: {
          min: parseInt(match[1].replace(/,/g, '')),
          max: parseInt(match[2].replace(/,/g, '')),
        },
        medianSalary: (parseInt(match[1].replace(/,/g, '')) + parseInt(match[2].replace(/,/g, ''))) / 2,
        additionalCompensation: await element.$eval('.salary-details__additional-compensation', (el: any) => el.textContent?.trim() || ''),
        sampleSize: parseInt(await element.$eval('.salary-details__sample-size', (el: any) => el.textContent?.match(/\d+/)?.[0] || '0')),
      };
    } catch (error) {
      console.error('Failed to extract salary details:', error);
      return null;
    }
  }
}

export default new LinkedInScraper();