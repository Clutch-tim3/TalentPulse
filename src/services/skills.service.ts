import redis from '../config/redis';
import scraperOrchestrator from '../scrapers/orchestrator';
import aiService from './ai.service';
import { SkillDemandData, TrendingSkill } from '../types/skills.types';

class SkillsService {
  private async getCacheKey(query: any): Promise<string> {
    return `skills:${JSON.stringify(query)}`;
  }

  async getSkillDemand(query: any): Promise<{ location: string; timeframe: string; skills: SkillDemandData[]; comparison_insight: string; ranking: string[] }> {
    const skills = query.skills.split(',').map((s: string) => s.trim());
    const cacheKey = await this.getCacheKey(query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const rawData = await scraperOrchestrator.scrapeSkillDemandData(skills, query.location);
    const synthesizedData = await aiService.synthesizeSkillDemand(rawData, query.location);
    
    const result = await this.formatSkillDemandData(synthesizedData, query);
    
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 6 * 60 * 60);
    
    return result;
  }

  async getTrendingSkills(query: any): Promise<{ generated_at: string; timeframe: string; category: string; trending_up: TrendingSkill[]; declining: TrendingSkill[] }> {
    const cacheKey = await this.getCacheKey(query);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const mockTrendingData = this.generateMockTrendingData(query);
    await redis.set(cacheKey, JSON.stringify(mockTrendingData), 'EX', 6 * 60 * 60);
    
    return mockTrendingData;
  }

  private async formatSkillDemandData(data: any, query: any): Promise<{ location: string; timeframe: string; skills: SkillDemandData[]; comparison_insight: string; ranking: string[] }> {
    const skillsData: SkillDemandData[] = data.skills.map((skillData: any) => ({
      skill: skillData.skill_name,
      category: skillData.skill_category,
      demand_score: skillData.demand_score,
      demand_label: this.getDemandLabel(skillData.demand_score),
      job_postings_estimate: skillData.job_postings_count,
      trend: skillData.demand_trend,
      trend_pct_90d: skillData.trend_pct_90d || 0,
      trend_label: this.getTrendLabel(skillData.trend, skillData.trend_pct_90d || 0),
      salary_premium_pct: skillData.avg_salary_premium_pct || 0,
      top_job_titles: skillData.top_job_titles || [],
      top_industries: skillData.top_industries || [],
      top_companies_hiring: skillData.top_companies || [],
      related_skills: skillData.related_skills || [],
      learning_resources: this.getLearningResources(skillData.skill_name),
    }));

    const sortedSkills = skillsData.sort((a, b) => b.demand_score - a.demand_score);
    const ranking = sortedSkills.map(skill => `${skill.skill} (${skill.demand_score})`);

    return {
      location: query.location,
      timeframe: query.timeframe,
      skills: skillsData,
      comparison_insight: this.generateComparisonInsight(skillsData),
      ranking,
    };
  }

  private generateMockTrendingData(query: any): any {
    const trendingUp: TrendingSkill[] = [
      {
        rank: 1,
        skill: 'Agentic AI / AI Agent Engineering',
        category: 'ai_ml',
        demand_score: 87,
        trend_pct_90d: 312,
        trend_label: 'Explosive Growth',
        avg_salary: 195000,
        why_trending: 'Enterprise adoption of AI agents across ops, customer service, and dev tooling has created massive demand for engineers who can build, orchestrate, and debug autonomous AI agent systems.',
        top_hiring_companies: ['Anthropic', 'OpenAI', 'Microsoft', 'Salesforce', 'ServiceNow'],
        entry_point: 'Prior experience with LLM APIs (OpenAI, Anthropic) is the most common entry point into this skill',
      },
      {
        rank: 2,
        skill: 'dbt (data build tool)',
        category: 'data_engineering',
        demand_score: 74,
        trend_pct_90d: 89,
        trend_label: 'Very High Growth',
        avg_salary: 148000,
        why_trending: 'Widespread adoption of the modern data stack (Snowflake + dbt + Airflow) has made dbt a near-mandatory skill for data engineers. Demand has doubled in 18 months.',
        top_hiring_companies: ['Snowflake', 'dbt Labs', 'Airflow', 'Databricks', 'Tableau'],
      },
    ];

    const declining: TrendingSkill[] = [
      {
        rank: 1,
        skill: 'Hadoop/MapReduce',
        category: 'data_engineering',
        demand_score: 35,
        trend_pct_90d: -41,
        trend_label: 'Declining Rapidly',
        avg_salary: 105000,
        why_declining: 'Being replaced by Spark, Snowflake, and cloud-native data platforms.',
        replacement_skills: ['Apache Spark', 'Snowflake', 'BigQuery'],
        top_hiring_companies: [],
      },
    ];

    return {
      generated_at: new Date().toISOString(),
      timeframe: query.timeframe,
      category: query.category,
      trending_up: trendingUp,
      declining: declining,
    };
  }

  private getDemandLabel(score: number): string {
    if (score >= 90) return 'Very High';
    if (score >= 70) return 'High';
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Low';
    return 'Very Low';
  }

  private getTrendLabel(trend: string, percentage: number): string {
    if (trend === 'rising') {
      if (percentage >= 100) return 'Explosive Growth';
      if (percentage >= 50) return 'Very High Growth';
      if (percentage >= 20) return 'High Growth';
      if (percentage >= 10) return 'Moderate Growth';
      return 'Stable';
    } else if (trend === 'declining') {
      if (percentage <= -50) return 'Collapsing';
      if (percentage <= -30) return 'Rapid Decline';
      if (percentage <= -15) return 'Declining';
      if (percentage <= -5) return 'Slow Decline';
      return 'Stable';
    }
    return 'Stable';
  }

  private generateComparisonInsight(skills: SkillDemandData[]): string {
    if (skills.length < 2) {
      return 'Single skill analysis shows demand trends over time.';
    }

    const sortedSkills = [...skills].sort((a, b) => b.demand_score - a.demand_score);
    const topSkill = sortedSkills[0];
    const fastestGrowing = [...skills].sort((a, b) => b.trend_pct_90d - a.trend_pct_90d)[0];

    return `${topSkill.skill} remains dominant (${topSkill.demand_score}/100) but ${fastestGrowing.skill} is the fastest-growing skill (+${fastestGrowing.trend_pct_90d}% 90-day). For career planning: ${topSkill.skill} maximizes immediate job opportunities; ${fastestGrowing.skill} maximizes differentiation and salary premium potential.`;
  }

  private getLearningResources(skill: string): Array<{ type: string; url?: string; name?: string }> {
    const resources: Record<string, Array<{ type: string; url?: string; name?: string }>> = {
      'React': [
        { type: 'official_docs', url: 'https://react.dev', name: 'React Documentation' },
        { type: 'certification', name: 'Meta React Developer Certificate' },
      ],
      'Vue': [
        { type: 'official_docs', url: 'https://vuejs.org', name: 'Vue Documentation' },
        { type: 'course', name: 'Vue.js Masterclass' },
      ],
      'Angular': [
        { type: 'official_docs', url: 'https://angular.io', name: 'Angular Documentation' },
        { type: 'certification', name: 'Google Angular Developer' },
      ],
      'Svelte': [
        { type: 'official_docs', url: 'https://svelte.dev', name: 'Svelte Documentation' },
        { type: 'course', name: 'Svelte for Beginners' },
      ],
    };

    return resources[skill] || [];
  }
}

export default new SkillsService();