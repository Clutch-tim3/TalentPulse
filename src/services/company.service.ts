import redis from '../config/redis';
import { CompanyHiringProfileResponse } from '../types/company.types';

class CompanyService {
  private async getCacheKey(query: any): Promise<string> {
    return `company:${JSON.stringify(query)}`;
  }

  async getCompanyHiringProfile(query: any): Promise<CompanyHiringProfileResponse> {
    const cacheKey = await this.getCacheKey(query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const hiringProfile = await this.generateMockHiringProfile(query.company);
    await redis.set(cacheKey, JSON.stringify(hiringProfile), 'EX', 12 * 60 * 60);
    
    return hiringProfile;
  }

  async compareCompanies(query: any): Promise<any> {
    const companies = query.companies.split(',').map((c: string) => c.trim());
    
    const profiles = await Promise.all(
      companies.map(async (company: string) => {
        return this.getCompanyHiringProfile({ company });
      })
    );

    return this.formatComparison(profiles, query.focus);
  }

  private async generateMockHiringProfile(companyName: string): Promise<CompanyHiringProfileResponse> {
    const baseProfile: CompanyHiringProfileResponse = {
      company: companyName,
      domain: `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      linkedin_url: `https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '')}`,
      hiring_snapshot: {
        open_roles_count: Math.floor(Math.random() * 500) + 50,
        snapshot_date: new Date().toISOString().split('T')[0],
        hiring_velocity: this.getHiringVelocity(Math.floor(Math.random() * 500) + 50),
        velocity_trend: ['stable', 'increasing', 'decreasing'][Math.floor(Math.random() * 3)],
        yoy_headcount_change_estimate: Math.floor(Math.random() * 50) - 10,
        total_headcount_estimate: Math.floor(Math.random() * 10000) + 500,
        headcount_trend: ['growing', 'stable', 'shrinking'][Math.floor(Math.random() * 3)],
      },
      hiring_breakdown: {
        by_department: [
          { department: 'Engineering', count: Math.floor(Math.random() * 200) + 50, pct: 0 },
          { department: 'Sales', count: Math.floor(Math.random() * 100) + 20, pct: 0 },
          { department: 'Product', count: Math.floor(Math.random() * 50) + 10, pct: 0 },
          { department: 'Operations', count: Math.floor(Math.random() * 50) + 10, pct: 0 },
          { department: 'Finance & Legal', count: Math.floor(Math.random() * 30) + 5, pct: 0 },
          { department: 'Marketing', count: Math.floor(Math.random() * 30) + 5, pct: 0 },
        ],
        by_seniority: {
          senior_and_above_pct: Math.floor(Math.random() * 70) + 30,
          note: 'Heavy senior hiring signals scaling of existing functions, not volume hiring of juniors',
        },
        by_location: [
          { location: 'Remote (US)', count: Math.floor(Math.random() * 200) + 50 },
          { location: 'San Francisco, CA', count: Math.floor(Math.random() * 100) + 20 },
          { location: 'New York, NY', count: Math.floor(Math.random() * 80) + 10 },
          { location: 'Dublin, Ireland', count: Math.floor(Math.random() * 50) + 5 },
          { location: 'Singapore', count: Math.floor(Math.random() * 30) + 5 },
        ],
      },
      strategic_signals: [
        {
          signal: 'Heavy investment in AI/ML engineering',
          evidence: `${Math.floor(Math.random() * 30) + 10} open AI/ML roles vs ${Math.floor(Math.random() * 10) + 5} in same period last year — ${Math.floor(Math.random() * 200) + 100}% increase`,
          implication: `${companyName} is building internal AI capability across ${['payments', 'fraud detection', 'developer tools', 'customer service'][Math.floor(Math.random() * 4)]}`,
        },
        {
          signal: 'Significant enterprise sales expansion',
          evidence: `${Math.floor(Math.random() * 80) + 20} open sales roles concentrated in Enterprise AE and Solutions Engineering`,
          implication: 'Moving upmarket — increasing focus on enterprise segment',
        },
      ],
      tech_stack_signals: {
        inferred_from: 'Job posting skill requirements',
        confirmed: ['Ruby', 'Go', 'Java', 'React', 'TypeScript', 'AWS', 'PostgreSQL', 'Kafka', 'Kubernetes'],
        emerging: ['Rust', 'LLM APIs', 'Vector databases'],
        note: 'Inferred from job posting requirements — not verified by company',
      },
      talent_intelligence: {
        avg_tenure_estimate: `${(Math.random() * 2 + 1).toFixed(1)} years`,
        attrition_signal: ['normal', 'high', 'low'][Math.floor(Math.random() * 3)],
        culture_signals: ['High technical bar', 'Fast-paced', 'Remote-friendly'],
        glassdoor_rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        interview_difficulty: 'High — typically 4-6 rounds for engineering',
      },
      top_roles_hiring: [
        { title: 'Senior Software Engineer', count: Math.floor(Math.random() * 60) + 20 },
        { title: 'Enterprise Account Executive', count: Math.floor(Math.random() * 40) + 10 },
        { title: 'Product Manager', count: Math.floor(Math.random() * 30) + 5 },
      ],
    };

    baseProfile.hiring_breakdown.by_department.forEach(dept => {
      dept.pct = Math.round((dept.count / baseProfile.hiring_snapshot.open_roles_count) * 100);
    });

    if (companyName.toLowerCase().includes('stripe')) {
      baseProfile.hiring_breakdown.by_department[0].count = 145;
      baseProfile.hiring_breakdown.by_department[1].count = 82;
      baseProfile.hiring_breakdown.by_department[2].count = 38;
      baseProfile.hiring_snapshot.open_roles_count = 342;
      baseProfile.hiring_breakdown.by_department.forEach(dept => {
        dept.pct = Math.round((dept.count / baseProfile.hiring_snapshot.open_roles_count) * 100);
      });
    }

    return baseProfile;
  }

  private getHiringVelocity(openRolesCount: number): string {
    if (openRolesCount > 500) return 'aggressive';
    if (openRolesCount > 100) return 'moderate';
    if (openRolesCount > 10) return 'conservative';
    return 'freeze';
  }

  private formatComparison(profiles: CompanyHiringProfileResponse[], focus: string): any {
    const comparison = profiles.map(profile => ({
      company: profile.company,
      domain: profile.domain,
      headcount: profile.hiring_snapshot.total_headcount_estimate,
      open_roles: profile.hiring_snapshot.open_roles_count,
      hiring_velocity: profile.hiring_snapshot.hiring_velocity,
      headcount_trend: profile.hiring_snapshot.headcount_trend,
      tech_stack: profile.tech_stack_signals.confirmed,
      engineering_headcount: Math.floor(profile.hiring_snapshot.total_headcount_estimate * 0.4),
      avg_tenure: profile.talent_intelligence.avg_tenure_estimate,
      culture_signals: profile.talent_intelligence.culture_signals,
      glassdoor_rating: profile.talent_intelligence.glassdoor_rating,
    }));

    return {
      companies_count: profiles.length,
      focus: focus,
      comparison: comparison,
    };
  }
}

export default new CompanyService();