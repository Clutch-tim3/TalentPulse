import { z } from 'zod';

export const CompanyHiringQuerySchema = z.object({
  company: z.string().min(1, 'Company name or domain is required'),
  include_open_roles: z.boolean().default(false),
  include_tech_stack: z.boolean().default(true),
});

export type CompanyHiringQuery = z.infer<typeof CompanyHiringQuerySchema>;

export const CompanyCompareQuerySchema = z.object({
  companies: z.string().min(1, 'Companies are required'),
  focus: z.enum(['salary', 'growth', 'tech_stack', 'culture', 'all']).default('all'),
});

export type CompanyCompareQuery = z.infer<typeof CompanyCompareQuerySchema>;

export interface CompanyHiringProfileResponse {
  company: string;
  domain: string;
  linkedin_url: string;
  hiring_snapshot: {
    open_roles_count: number;
    snapshot_date: string;
    hiring_velocity: string;
    velocity_trend: string;
    yoy_headcount_change_estimate: number;
    total_headcount_estimate: number;
    headcount_trend: string;
  };
  hiring_breakdown: {
    by_department: Array<{
      department: string;
      count: number;
      pct: number;
    }>;
    by_seniority: {
      senior_and_above_pct: number;
      note: string;
    };
    by_location: Array<{
      location: string;
      count: number;
    }>;
  };
  strategic_signals: Array<{
    signal: string;
    evidence: string;
    implication: string;
  }>;
  tech_stack_signals: {
    inferred_from: string;
    confirmed: string[];
    emerging: string[];
    note: string;
  };
  talent_intelligence: {
    avg_tenure_estimate: string;
    attrition_signal: string;
    culture_signals: string[];
    glassdoor_rating: number;
    interview_difficulty: string;
  };
  top_roles_hiring: Array<{
    title: string;
    count: number;
  }>;
}