import redis from '../config/redis';
import scraperOrchestrator from '../scrapers/orchestrator';
import aiService from './ai.service';

class RolesService {
  private async getCacheKey(query: any): Promise<string> {
    return `roles:${JSON.stringify(query)}`;
  }

  async getRoleIntelligence(query: any): Promise<any> {
    const cacheKey = await this.getCacheKey(query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const rawData = await scraperOrchestrator.scrapeJobData(query.job_title, query.location || 'global', 10);
    const synthesizedData = await aiService.synthesizeRoleIntelligence(rawData);
    
    const roleData = await this.enrichRoleData(synthesizedData, query);
    
    await redis.set(cacheKey, JSON.stringify(roleData), 'EX', 72 * 60 * 60);
    
    return roleData;
  }

  private async enrichRoleData(data: any, query: any): Promise<any> {
    const roleData = {
      role: data.job_title_normalised || query.job_title,
      also_known_as: data.also_known_as || [],
      career_level: data.career_level || 'individual_contributor',
      seniority_tier: this.determineSeniorityTier(data.career_level),
      role_summary: data.role_summary || 'No detailed summary available.',
      typical_responsibilities: data.typical_responsibilities || [],
      required_skills: data.required_skills || [],
      nice_to_have_skills: data.nice_to_have_skills || [],
      typical_qualifications: data.typical_qualifications || [],
      what_separates_senior_from_staff: '',
      career_paths: {
        typical_progression_to: data.typical_progression || [],
        progression_from: this.getProgressionFrom(data.career_level),
      },
      market_outlook: {
        demand: data.demand_outlook || 'Stable',
        outlook: data.demand_outlook || 'Stable',
        outlook_reason: data.demand_outlook_reason || '',
        automation_risk: data.automation_risk || 'Low',
        automation_rationale: data.automation_risk_rationale || '',
        remote_friendliness: data.remote_friendliness || 'hybrid',
        typical_time_to_fill_days: 30,
        talent_supply: 'Moderate',
      },
      salary_snapshot: {
        us_median: 0,
        sf_median: 0,
        remote_us_median: 0,
        london_median_gbp: 0,
      },
      adjacent_roles: data.adjacent_roles || [],
    };

    if (roleData.career_level === 'individual_contributor' && query.job_title.toLowerCase().includes('staff')) {
      roleData.seniority_tier = 'Staff/Principal (top 5% of ICs)';
      roleData.what_separates_senior_from_staff = 'A Senior Engineer solves well-defined problems excellently. A Staff Engineer defines which problems are worth solving and builds the systems and standards that enable others to solve them better.';
    }
    
    return roleData;
  }

  private determineSeniorityTier(careerLevel: string): string {
    const level = careerLevel.toLowerCase();
    
    if (level.includes('individual_contributor') || level.includes('staff')) {
      return 'Staff/Principal (top 5% of ICs)';
    }
    if (level.includes('manager')) {
      return 'Manager (L5-L6)';
    }
    if (level.includes('director')) {
      return 'Director (L7-L8)';
    }
    if (level.includes('executive') || level.includes('vp') || level.includes('cto') || level.includes('cpo')) {
      return 'Executive (L9+)';
    }
    
    return 'Individual Contributor (L3-L4)';
  }

  private getProgressionFrom(careerLevel: string): any[] {
    const level = careerLevel.toLowerCase();
    
    if (level.includes('individual_contributor')) {
      return [
        {
          from: 'Senior Software Engineer',
          to: 'Staff Engineer',
          avg_years: 4,
          difficulty: 'High',
          key_requirement: 'Demonstrated organizational impact, not just team-level excellence',
        },
      ];
    }
    
    if (level.includes('manager')) {
      return [
        {
          from: 'Senior Engineer',
          to: 'Engineering Manager',
          avg_years: 5,
          difficulty: 'Moderate',
          key_requirement: 'Strong technical foundation + leadership skills',
        },
      ];
    }
    
    return [];
  }
}

export default new RolesService();