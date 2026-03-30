export interface ErrorDetails {
  code: string;
  message: string;
  status: number;
  hint?: string;
  supported_regions?: string[];
  minimum_data_points?: number;
  current_data_points?: number;
  suggestion?: string;
  retry_after_seconds?: number;
}

export const errorCatalogue: Record<string, ErrorDetails> = {
  // Auth errors
  MISSING_API_KEY: {
    code: 'MISSING_API_KEY',
    message: 'API key is missing. Please include your API key in the X-RapidAPI-Key header.',
    status: 401
  },
  INVALID_API_KEY: {
    code: 'INVALID_API_KEY',
    message: 'API key is invalid. Please check your API key and try again.',
    status: 401
  },
  TIER_INSUFFICIENT: {
    code: 'TIER_INSUFFICIENT',
    message: 'Your API tier does not support this endpoint. Please upgrade your plan.',
    status: 403
  },
  
  // Rate/Quota errors
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded. Please try again later.',
    status: 429
  },
  QUOTA_EXCEEDED: {
    code: 'QUOTA_EXCEEDED',
    message: 'Monthly quota exceeded. Please upgrade your plan or wait for the next billing cycle.',
    status: 429
  },
  
  // Input errors (422)
  TITLE_NOT_RECOGNISED: {
    code: 'TITLE_NOT_RECOGNISED',
    message: 'Job title not recognised. Please provide a valid job title.',
    status: 422,
    hint: 'Try GET /v1/titles/normalise first'
  },
  LOCATION_NOT_SUPPORTED: {
    code: 'LOCATION_NOT_SUPPORTED',
    message: 'Location not supported. Please provide a valid location.',
    status: 422,
    supported_regions: ["South Africa", "Gauteng", "Cape Town", "Johannesburg", "Pretoria", "Durban", "KwaZulu-Natal", "Western Cape", "Eastern Cape", "Northern Cape", "Free State", "North West", "Mpumalanga", "Limpopo"]
  },
  INVALID_EXPERIENCE_YEARS: {
    code: 'INVALID_EXPERIENCE_YEARS',
    message: 'Experience years must be between 0 and 50.',
    status: 422
  },
  INVALID_CURRENCY: {
    code: 'INVALID_CURRENCY',
    message: 'Invalid currency. Only ZAR, USD, EUR, and GBP are supported.',
    status: 422
  },
  SKILLS_LIST_EMPTY: {
    code: 'SKILLS_LIST_EMPTY',
    message: 'Skills list cannot be empty. Please provide at least 1 skill.',
    status: 422
  },
  SKILLS_LIST_TOO_LONG: {
    code: 'SKILLS_LIST_TOO_LONG',
    message: 'Skills list is too long. Maximum 30 skills per request.',
    status: 422
  },
  COMPANY_NOT_FOUND: {
    code: 'COMPANY_NOT_FOUND',
    message: 'Company not found. Please provide a valid company name.',
    status: 422,
    hint: 'Try searching partial name: "FNB" not "First National Bank"'
  },
  INVALID_PERIOD: {
    code: 'INVALID_PERIOD',
    message: 'Invalid period. Supported periods: 1m, 3m, 6m, 1y, 2y.',
    status: 422
  },
  TOO_MANY_LOCATIONS: {
    code: 'TOO_MANY_LOCATIONS',
    message: 'Too many locations. Maximum 10 locations per request.',
    status: 422
  },
  TOO_MANY_COMPANIES: {
    code: 'TOO_MANY_COMPANIES',
    message: 'Too many companies. Maximum 10 companies per request.',
    status: 422
  },
  
  // Data errors (404)
  BENCHMARK_DATA_NOT_FOUND: {
    code: 'BENCHMARK_DATA_NOT_FOUND',
    message: 'Insufficient data for this role/location combination.',
    status: 404,
    minimum_data_points: 30,
    current_data_points: 4,
    suggestion: 'Try a nearby city or a more common role title'
  },
  NO_JOB_POSTINGS_FOUND: {
    code: 'NO_JOB_POSTINGS_FOUND',
    message: 'No active job postings found for this search.',
    status: 404
  },
  
  // Server errors (503)
  DATA_REFRESH_IN_PROGRESS: {
    code: 'DATA_REFRESH_IN_PROGRESS',
    message: 'Data refresh in progress. Please try again later.',
    status: 503,
    retry_after_seconds: 300
  }
};
