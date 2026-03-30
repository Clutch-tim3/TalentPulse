import axios from 'axios';
import * as cheerio from 'cheerio';

interface IndeedJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  postedDate: string;
  url: string;
}

interface IndeedSalary {
  jobTitle: string;
  location: string;
  salaryRange: string;
  sourceCount: number;
  medianSalary: number;
  salaryByExperience: Array<{
    experienceLevel: string;
    salary: string;
  }>;
}

class IndeedScraper {
  // private minDelay = parseInt(process.env.SCRAPING_MIN_DELAY_MS || '2000');
  // private maxDelay = parseInt(process.env.SCRAPING_MAX_DELAY_MS || '5000');

  // private async delay(): Promise<void> {
  //   const delayTime = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
  //   await new Promise(resolve => setTimeout(resolve, delayTime));
  // }

  async searchJobs(title: string, location: string, limit: number = 20): Promise<IndeedJob[]> {
    try {
      const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(title)}&l=${encodeURIComponent(location)}`;
      
      const response = await axios.get(searchUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      const $ = cheerio.load(response.data);
      const jobs: IndeedJob[] = [];

      $('.jobsearch-SerpJobCard').each((_index: number, element: any) => {
        try {
          const job = this.extractJobDetails($, $(element));
          if (job) {
            jobs.push(job);
          }
        } catch (error) {
          console.error('Failed to extract job details:', error);
        }
      });

      return jobs.slice(0, limit);
    } catch (error) {
      console.error('Indeed job search failed:', error);
      return [];
    }
  }

  private extractJobDetails($: any, element: any): IndeedJob | null {
    try {
      const title = $(element).find('.title a').text().trim();
      const company = $(element).find('.company').text().trim();
      const location = $(element).find('.location').text().trim();
      const salary = $(element).find('.salaryText').text().trim();
      const description = $(element).find('.summary').text().trim();
      const postedDate = $(element).find('.date').text().trim();
      const relativeUrl = $(element).find('.title a').attr('href');
      const url = relativeUrl ? `https://www.indeed.com${relativeUrl}` : '';

      return {
        title,
        company,
        location,
        salary,
        description,
        postedDate,
        url,
      };
    } catch (error) {
      console.error('Failed to extract job details from element:', error);
      return null;
    }
  }

  async getSalaryData(jobTitle: string, location: string): Promise<IndeedSalary[]> {
    try {
      const formattedTitle = jobTitle.toLowerCase().replace(/\s+/g, '-');
      const salaryUrl = `https://www.indeed.com/career/${formattedTitle}/salaries/${location}`;

      const response = await axios.get(salaryUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      const salaries: IndeedSalary[] = [];

      $('.salary-info').each((_index: number, element: any) => {
        try {
          const salary = this.extractSalaryDetails($, $(element));
          if (salary) {
            salaries.push(salary);
          }
        } catch (error) {
          console.error('Failed to extract salary details:', error);
        }
      });

      return salaries;
    } catch (error) {
      console.error('Indeed salary scrape failed:', error);
      return [];
    }
  }

  private extractSalaryDetails($: any, element: any): IndeedSalary | null {
    try {
      const jobTitle = $(element).find('.salary-title').text().trim();
      const location = $(element).find('.salary-location').text().trim();
      const salaryRange = $(element).find('.salary-range').text().trim();
      const sourceCount = parseInt($(element).find('.salary-sources').text().match(/\d+/)?.[0] || '0');

      const salaryByExperience: Array<{ experienceLevel: string; salary: string }> = [];
      $(element).find('.experience-salary').each((_index: number, expElement: any) => {
        const experienceLevel = $(expElement).find('.experience-level').text().trim();
        const salary = $(expElement).find('.experience-salary-value').text().trim();
        salaryByExperience.push({ experienceLevel, salary });
      });

      let medianSalary = 0;
      const rangeMatch = salaryRange.match(/\$(\d{1,3}(?:,\d{3})*)/g);
      if (rangeMatch && rangeMatch.length >= 2) {
        const min = parseInt(rangeMatch[0].replace(/[$,]/g, ''));
        const max = parseInt(rangeMatch[1].replace(/[$,]/g, ''));
        medianSalary = (min + max) / 2;
      } else if (rangeMatch && rangeMatch.length === 1) {
        medianSalary = parseInt(rangeMatch[0].replace(/[$,]/g, ''));
      }

      return {
        jobTitle,
        location,
        salaryRange,
        sourceCount,
        medianSalary,
        salaryByExperience,
      };
    } catch (error) {
      console.error('Failed to extract salary details from element:', error);
      return null;
    }
  }
}

export default new IndeedScraper();