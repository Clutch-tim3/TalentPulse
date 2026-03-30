import { z } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: ApiMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiMeta {
  request_id: string;
  version: string;
  processing_ms: number;
  from_cache: boolean;
  cache_age_minutes?: number;
  data_freshness?: string;
  data_as_of?: string;
  next_update?: string;
  freshness_note?: string;
}

export const ExperienceLevelSchema = z.enum(['entry', 'mid', 'senior', 'lead', 'principal', 'executive']);
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;

export const CompanySizeSchema = z.enum(['startup', 'scaleup', 'enterprise']);
export type CompanySize = z.infer<typeof CompanySizeSchema>;

export const IndustrySchema = z.string();
export type Industry = z.infer<typeof IndustrySchema>;

export const LocationTypeSchema = z.enum(['city', 'region', 'country', 'remote', 'global']);
export type LocationType = z.infer<typeof LocationTypeSchema>;

export const SkillCategorySchema = z.enum([
  'programming_language',
  'framework',
  'tool',
  'methodology',
  'soft_skill',
  'certification',
  'domain',
]);
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export const TrendDirectionSchema = z.enum(['rising', 'declining', 'both']);
export type TrendDirection = z.infer<typeof TrendDirectionSchema>;

export const TimeframeSchema = z.enum(['30d', '90d', '6m', '1y']);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const RoleCategorySchema = z.enum([
  'engineering',
  'data',
  'product',
  'design',
  'marketing',
  'finance',
  'operations',
  'all',
]);
export type RoleCategory = z.infer<typeof RoleCategorySchema>;

export const ConfidenceSchema = z.enum(['high', 'medium', 'low']);
export type Confidence = z.infer<typeof ConfidenceSchema>;