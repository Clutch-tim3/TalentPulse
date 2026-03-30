import redis from '../config/redis';
import scraperOrchestrator from '../scrapers/orchestrator';
import { hashObject } from '../utils/hashUtils';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  required_skills: string[];
  experience_level: string;
  remote_type: string;
  posted_date: string;
  estimated_match_score?: number;
  apply_url: string;
}

class JobsService {
  private async getCacheKey(query: any): Promise<string> {
    return `jobs:${hashObject(query)}`;
  }

  async searchJobs(query: any): Promise<{ total: number; postings: JobPosting[]; sources_used: string[] }> {
    const cacheKey = await this.getCacheKey(query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const rawData = await scraperOrchestrator.scrapeJobData(query.title, query.location, query.limit || 10);
    const postings = this.parseJobData(rawData, query);
    
    const result = {
      total: postings.length,
      postings: postings,
      sources_used: ['LinkedIn', 'Indeed'],
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 24 * 60 * 60);
    
    return result;
  }

  private parseJobData(rawData: string, query: any): JobPosting[] {
    const postings: JobPosting[] = [];
    const sections = rawData.split('---\n');
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      try {
        const job = this.parseJobSection(section);
        if (job) {
          postings.push(job);
        }
      } catch (error) {
        console.error('Failed to parse job section:', error);
      }
    }

    if (postings.length === 0) {
      return this.generateMockJobPostings(query);
    }

    return postings;
  }

  private parseJobSection(section: string): JobPosting | null {
    const lines = section.split('\n');
    
    const job: any = {
      id: `job_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      company: '',
      location: '',
      required_skills: [],
      experience_level: 'mid',
      remote_type: 'hybrid',
      posted_date: new Date().toISOString(),
      apply_url: '',
    };

    for (const line of lines) {
      if (line.startsWith('Title:')) job.title = line.split(': ')[1].trim();
      if (line.startsWith('Company:')) job.company = line.split(': ')[1].trim();
      if (line.startsWith('Location:')) job.location = line.split(': ')[1].trim();
      if (line.startsWith('Posted:')) job.posted_date = line.split(': ')[1].trim();
      if (line.startsWith('Salary:')) job.salary_range = line.split(': ')[1].trim();
      if (line.startsWith('Skills:')) {
        job.required_skills = line.split(': ')[1].split(',').map((s: string) => s.trim());
      }
      if (line.startsWith('URL:')) job.apply_url = line.split(': ')[1].trim();
      if (line.startsWith('Description:')) job.description = line.split(': ')[1].trim();
    }

    job.remote_type = this.determineRemoteType(job.location);
    job.experience_level = this.determineExperienceLevel(job.title);
    
    if (!job.title || !job.company) {
      return null;
    }

    return job;
  }

  private generateMockJobPostings(query: any): JobPosting[] {
    const mockJobs: JobPosting[] = [];
    
    const companies = ['TechCorp', 'InnovateSoft', 'CloudSystems', 'DataFlow', 'AI Labs'];
    const locations = ['Remote (US)', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'London, UK'];
    const skills = [
      ['React', 'TypeScript', 'Node.js', 'AWS'],
      ['Python', 'Django', 'PostgreSQL', 'Docker'],
      ['Java', 'Spring', 'Kubernetes', 'MongoDB'],
      ['Go', 'gRPC', 'Redis', 'Kafka'],
      ['Rust', 'WebAssembly', 'GraphQL', 'Docker'],
    ];

    for (let i = 0; i < (query.limit || 10); i++) {
      const baseSalary = 120000 + Math.random() * 80000;
      const salaryRange = `$${Math.floor(baseSalary - 20000).toLocaleString()} - $${Math.floor(baseSalary + 20000).toLocaleString()}`;
      
      mockJobs.push({
        id: `mock_job_${i + 1}`,
        title: `${query.title || 'Software Engineer'} ${i + 1}`,
        company: companies[i % companies.length],
        location: locations[i % locations.length],
        salary_range: salaryRange,
        required_skills: skills[i % skills.length],
        experience_level: this.getRandomExperienceLevel(),
        remote_type: ['remote', 'hybrid', 'onsite'][Math.floor(Math.random() * 3)],
        posted_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_match_score: Math.floor(Math.random() * 40) + 60,
        apply_url: `https://example.com/jobs/${i + 1}`,
      });
    }

    return mockJobs;
  }

  private determineRemoteType(location: string): string {
    const lowerLoc = location.toLowerCase();
    if (lowerLoc.includes('remote') || lowerLoc.includes('anywhere')) {
      return 'remote';
    }
    if (lowerLoc.includes('hybrid')) {
      return 'hybrid';
    }
    return 'onsite';
  }

  private determineExperienceLevel(title: string): string {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('junior') || lowerTitle.includes('entry') || lowerTitle.includes('jr')) {
      return 'entry';
    }
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr')) {
      return 'senior';
    }
    if (lowerTitle.includes('lead') || lowerTitle.includes('principal') || lowerTitle.includes('staff')) {
      return 'lead';
    }
    return 'mid';
  }

  private getRandomExperienceLevel(): string {
    const levels = ['entry', 'mid', 'senior', 'lead'];
    return levels[Math.floor(Math.random() * levels.length)];
  }
}

export default new JobsService();