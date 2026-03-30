import linkedinScraper from './linkedin.scraper';
import indeedScraper from './indeed.scraper';
import glassdoorScraper from './glassdoor.scraper';
import levelsScraper from './levels.scraper';
import blsScraper from './bls.scraper';
import onsScraper from './ons.scraper';

class ScraperOrchestrator {
  async scrapeSalaryData(jobTitle: string, location: string): Promise<string> {
    // const rawData: string[] = [];

    const scrapers = [
      { name: 'BLS', scraper: blsScraper.getOccupationData, format: this.formatBLSSalary },
      { name: 'ONS', scraper: onsScraper.getSalaryData, format: this.formatONSSalary },
      { name: 'Glassdoor', scraper: glassdoorScraper.getSalaryData, format: this.formatGlassdoorSalary },
      { name: 'Levels.fyi', scraper: levelsScraper.getSalaryData, format: this.formatLevelsSalary },
      { name: 'LinkedIn', scraper: linkedinScraper.getSalaryData, format: this.formatLinkedInSalary },
      { name: 'Indeed', scraper: indeedScraper.getSalaryData, format: this.formatIndeedSalary },
    ];

    const results = await Promise.allSettled(
      scrapers.map(async ({ name, scraper, format }) => {
        try {
          const data = await scraper(jobTitle, location);
          const formattedData = format(data);
          if (formattedData) {
            return `---\n${name} Data:\n${formattedData}`;
          }
          return null;
        } catch (error) {
          console.error(`Failed to scrape ${name}:`, error);
          return null;
        }
      })
    );

    return results
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean)
      .join('\n');
  }

  async scrapeJobData(jobTitle: string, location: string, limit: number = 20): Promise<string> {
    const jobData: any[] = [];

    const scrapers = [
      { name: 'LinkedIn', scraper: linkedinScraper.searchJobs },
      { name: 'Indeed', scraper: indeedScraper.searchJobs },
    ];

    const results = await Promise.allSettled(
      scrapers.map(async ({ name, scraper }) => {
        try {
          const jobs = await scraper(jobTitle, location, Math.ceil(limit / scrapers.length));
          return jobs.map(job => ({ ...job, source: name }));
        } catch (error) {
          console.error(`Failed to scrape jobs from ${name}:`, error);
          return [];
        }
      })
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        jobData.push(...result.value);
      }
    });

    return this.formatJobData(jobData);
  }

  async scrapeSkillDemandData(skills: string[], location: string): Promise<string> {
    const skillData: any[] = [];

    const scrapers = [
      { name: 'LinkedIn', scraper: linkedinScraper.searchJobs },
      { name: 'Indeed', scraper: indeedScraper.searchJobs },
    ];

    for (const skill of skills) {
      for (const { name, scraper } of scrapers) {
        try {
          const jobs = await scraper(skill, location, 10);
          const count = jobs.length;
          skillData.push({
            skill,
            source: name,
            job_count: count,
            top_job_titles: jobs.slice(0, 3).map((job: any) => job.title),
          });
        } catch (error) {
          console.error(`Failed to scrape skill demand for ${skill} from ${name}:`, error);
        }
      }
    }

    return this.formatSkillDemandData(skillData);
  }

  private formatBLSSalary(data: any[]): string {
    return data.map(d => 
      `Occupation: ${d.occupationName} (${d.occupationCode})\n` +
      `Median Salary: $${d.medianSalary.toLocaleString()}\n` +
      `10th Percentile: $${d.p10.toLocaleString()}\n` +
      `25th Percentile: $${d.p25.toLocaleString()}\n` +
      `75th Percentile: $${d.p75.toLocaleString()}\n` +
      `90th Percentile: $${d.p90.toLocaleString()}\n` +
      `Employment: ${d.employment.toLocaleString()}`
    ).join('\n\n');
  }

  private formatONSSalary(data: any[]): string {
    return data.map(d => 
      `Year: ${d.year}\n` +
      `Median Salary: £${d.median.toLocaleString()}\n` +
      `Mean Salary: £${d.mean.toLocaleString()}\n` +
      `10th Percentile: £${d.p10.toLocaleString()}\n` +
      `25th Percentile: £${d.p25.toLocaleString()}\n` +
      `75th Percentile: £${d.p75.toLocaleString()}\n` +
      `90th Percentile: £${d.p90.toLocaleString()}\n` +
      `Sample Size: ${d.sampleSize}`
    ).join('\n\n');
  }

  private formatGlassdoorSalary(data: any[]): string {
    return data.map(d => 
      `Job Title: ${d.jobTitle}\n` +
      `Location: ${d.location}\n` +
      `Experience: ${d.experienceLevel}\n` +
      `Company: ${d.company}\n` +
      `Base Salary: $${d.baseSalary.toLocaleString()}\n` +
      `Bonus: $${d.bonus.toLocaleString()}\n` +
      `Total Comp: $${d.totalComp.toLocaleString()}\n` +
      `Salary Range: ${d.salaryRange}\n` +
      `Sample Size: ${d.sampleSize}\n` +
      `Posted: ${d.postedDate}`
    ).join('\n\n');
  }

  private formatLevelsSalary(data: any[]): string {
    return data.map(d => 
      `Company: ${d.company}\n` +
      `Level: ${d.level}\n` +
      `Title: ${d.title}\n` +
      `Base Salary: $${d.baseSalary.toLocaleString()}\n` +
      `Stock: $${d.stock.toLocaleString()}\n` +
      `Bonus: $${d.bonus.toLocaleString()}\n` +
      `Total Comp: $${d.totalComp.toLocaleString()}\n` +
      `Location: ${d.location}\n` +
      `Experience: ${d.yearsExperience} years`
    ).join('\n\n');
  }

  private formatLinkedInSalary(data: any[]): string {
    return data.map(d => 
      `Job Title: ${d.jobTitle}\n` +
      `Location: ${d.location}\n` +
      `Experience: ${d.experienceLevel}\n` +
      `Salary Range: $${d.baseSalaryRange.min.toLocaleString()} - $${d.baseSalaryRange.max.toLocaleString()}\n` +
      `Median Salary: $${d.medianSalary.toLocaleString()}\n` +
      `Additional Comp: ${d.additionalCompensation}\n` +
      `Sample Size: ${d.sampleSize}`
    ).join('\n\n');
  }

  private formatIndeedSalary(data: any[]): string {
    return data.map(d => 
      `Job Title: ${d.jobTitle}\n` +
      `Location: ${d.location}\n` +
      `Salary Range: ${d.salaryRange}\n` +
      `Median Salary: $${d.medianSalary.toLocaleString()}\n` +
      `Sample Size: ${d.sourceCount}\n` +
      `Experience Breakdown:\n${d.salaryByExperience.map((exp: any) => 
        `  ${exp.experienceLevel}: ${exp.salary}`
      ).join('\n')}`
    ).join('\n\n');
  }

  private formatJobData(data: any[]): string {
    return data.map(d => 
      `---\nSource: ${d.source}\n` +
      `Title: ${d.title}\n` +
      `Company: ${d.company}\n` +
      `Location: ${d.location}\n` +
      `Posted: ${d.postedDate}\n` +
      `Salary: ${d.salary}\n` +
      `Description: ${d.description}\n` +
      `Skills: ${d.skills?.join(', ') || 'Not listed'}\n` +
      `URL: ${d.url}`
    ).join('\n');
  }

  private formatSkillDemandData(data: any[]): string {
    return data.map(d => 
      `---\nSkill: ${d.skill}\n` +
      `Source: ${d.source}\n` +
      `Job Count: ${d.job_count}\n` +
      `Top Job Titles: ${d.top_job_titles?.join(', ') || 'Not available'}`
    ).join('\n');
  }
}

export default new ScraperOrchestrator();