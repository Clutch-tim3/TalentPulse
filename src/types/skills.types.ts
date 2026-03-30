import { z } from 'zod';

export const SkillDemandQuerySchema = z.object({
  skills: z.string().min(1, 'Skills are required'),
  location: z.string().default('global'),
  job_category: z.enum([
    'engineering',
    'data',
    'product',
    'design',
    'marketing',
    'finance',
    'operations',
    'all',
  ]).optional(),
  timeframe: z.enum(['30d', '90d', '6m', '1y']).default('90d'),
});

export type SkillDemandQuery = z.infer<typeof SkillDemandQuerySchema>;

export const TrendingSkillsQuerySchema = z.object({
  category: z.enum([
    'all',
    'engineering',
    'data_ai',
    'cloud',
    'product',
    'design',
    'finance',
    'marketing',
    'legal',
  ]).default('all'),
  location: z.string().default('global'),
  trend_direction: z.enum(['rising', 'declining', 'both']).default('rising'),
  limit: z.number().int().min(1).max(50).default(20),
  timeframe: z.enum(['30d', '90d']).default('90d'),
});

export type TrendingSkillsQuery = z.infer<typeof TrendingSkillsQuerySchema>;

export const SkillGapAnalysisRequestSchema = z.object({
  current_skills: z.array(z.string()).min(1, 'Current skills are required'),
  current_role: z.string().optional(),
  target_role: z.string().min(1, 'Target role is required'),
  target_location: z.string().optional(),
  target_timeline_months: z.number().int().optional(),
  experience_years: z.number().min(0).optional(),
});

export type SkillGapAnalysisRequest = z.infer<typeof SkillGapAnalysisRequestSchema>;

export interface SkillDemandData {
  skill: string;
  category: string;
  demand_score: number;
  demand_label: string;
  job_postings_estimate: number;
  trend: string;
  trend_pct_90d: number;
  trend_label: string;
  salary_premium_pct: number;
  top_job_titles: string[];
  top_industries: string[];
  top_companies_hiring: string[];
  related_skills: string[];
  learning_resources?: Array<{
    type: string;
    url?: string;
    name?: string;
  }>;
  commentary?: string;
}

export interface TrendingSkill {
  rank: number;
  skill: string;
  category: string;
  demand_score: number;
  trend_pct_90d: number;
  trend_label: string;
  avg_salary: number;
  why_trending?: string;
  top_hiring_companies: string[];
  entry_point?: string;
  replacement_skills?: string[];
  why_declining?: string;
}

export interface SkillGapAnalysisResponse {
  current_role?: string;
  target_role: string;
  overall_readiness: number;
  readiness_label: string;
  skill_assessment: {
    already_have: Array<{
      skill: string;
      relevance_to_target: string;
      strength: string;
    }>;
    gaps: Array<{
      skill: string;
      priority: number;
      importance: string;
      frequency_in_target_jds: number;
      time_to_learn_estimate: string;
      why_needed: string;
      recommended_resources?: Array<{
        type: string;
        name?: string;
        platform?: string;
        hours?: number;
        description?: string;
      }>;
      salary_impact?: string;
    }>;
  };
  learning_path: {
    total_estimated_weeks: number;
    fits_timeline: boolean;
    phases: Array<{
      phase: number;
      weeks: string;
      focus: string;
      goal: string;
      milestone: string;
    }>;
  };
  salary_impact: {
    current_role_london_median: number;
    target_role_london_median: number;
    salary_increase_estimate: string;
    increase_pct: number;
  };
  job_market_snapshot: {
    target_role_london_openings: number;
    competition_level: string;
    time_to_first_interview_estimate: string;
  };
}