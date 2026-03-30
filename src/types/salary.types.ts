import { z } from 'zod';

export const SalaryBenchmarkQuerySchema = z.object({
  job_title: z.string().min(1, 'Job title is required'),
  location: z.string().min(1, 'Location is required'),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'principal', 'executive']).default('mid'),
  skills: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.enum(['startup', 'scaleup', 'enterprise']).optional(),
  include_equity: z.boolean().default(false),
  include_benefits: z.boolean().default(false),
  currency: z.string().default('USD'),
});

export type SalaryBenchmarkQuery = z.infer<typeof SalaryBenchmarkQuerySchema>;

export const SalaryCompareQuerySchema = z.object({
  job_title: z.string().min(1, 'Job title is required'),
  locations: z.string().min(1, 'Locations are required'),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'principal', 'executive']).default('mid'),
  currency: z.string().default('USD'),
});

export type SalaryCompareQuery = z.infer<typeof SalaryCompareQuerySchema>;

export interface SalaryBenchmark {
  query: {
    job_title_input: string;
    job_title_normalised: string;
    location: string;
    location_type: string;
    experience_level: string;
    currency: string;
  };
  salary: {
    currency: string;
    period: string;
    base: {
      min: number;
      p25: number;
      median: number;
      mean: number;
      p75: number;
      max: number;
    };
    formatted: {
      min: string;
      p25: string;
      median: string;
      mean: string;
      p75: string;
      max: string;
    };
    hourly_equivalent: {
      median: string;
      p25: string;
      p75: string;
    };
  };
  total_compensation?: {
    cash_bonus_typical_pct: number;
    cash_bonus_median: number;
    equity_typical: string;
    total_comp_median: number;
    total_comp_p75: number;
    note: string;
  };
  location_context: {
    cost_of_living_index: number;
    salary_vs_national_median_pct: number;
    remote_salary_comparison: {
      national_remote_median: number;
      sf_premium_pct: number;
      note: string;
    };
  };
  market_context: {
    demand_level: string;
    open_positions_estimate: string;
    avg_days_to_fill: number;
    candidate_supply: string;
    employer_vs_candidate_leverage: string;
    yoy_salary_change_pct: number;
    salary_trend: string;
    commentary: string;
  };
  skills_premium: Array<{
    skill: string;
    premium_pct: number;
    median_with_skill: number;
  }>;
  company_type_breakdown: {
    [key: string]: {
      median: number;
      equity_note: string;
    };
  };
  confidence: string;
  sample_size_estimate: string;
  data_sources: string[];
  methodology_note: string;
  last_refreshed: string;
}

export interface SalaryComparisonItem {
  location: string;
  median_salary: number;
  formatted: string;
  cost_of_living_index?: number;
  purchasing_power_adjusted?: number;
  rank: number;
  vs_national_avg_pct?: number;
  median_salary_local?: number;
  local_currency?: string;
  note?: string;
}

export interface SalaryComparison {
  job_title: string;
  experience_level: string;
  currency: string;
  comparison: SalaryComparisonItem[];
  insight: string;
  highest_nominal: string;
  highest_adjusted: string;
}

export interface SalaryEvaluationRequest {
  job_title: string;
  location: string;
  offered_salary: number;
  currency: string;
  experience_years: number;
  skills: string[];
  industry: string;
  company_stage: string;
  offered_equity?: string;
  offered_bonus_pct?: number;
}

export interface SalaryEvaluationResponse {
  offer_assessment: {
    verdict: string;
    percentile: number;
    verdict_detail: string;
    vs_market: {
      market_p25: number;
      market_median: number;
      market_p75: number;
      your_offer: number;
      gap_to_median: number;
      gap_pct: number;
    };
  };
  negotiation_intelligence: {
    should_negotiate: boolean;
    negotiation_strength: string;
    recommended_counter: number;
    counter_rationale: string;
    walkaway_point: number;
    negotiation_script_bullets: string[];
    what_else_to_negotiate: string[];
  };
  total_compensation_view: {
    base_salary: number;
    expected_bonus: number;
    equity_estimated_value: number;
    total_comp_estimate: number;
    market_total_comp_median: number;
    total_comp_gap: number;
    note: string;
  };
}