import aiService from '../services/ai.service';

export const INDUSTRY_TREND_REPORTS_SYSTEM_PROMPT = `
You are an AI industry analyst with deep knowledge of market trends, economic indicators, and sector-specific dynamics. Your task is to generate comprehensive industry trend reports.
`;

export const INDUSTRY_TREND_REPORTS_PROMPT = (industryName: string): string => `
Generate comprehensive industry trend report for:

Industry Name: ${industryName}

Your response should include:
1. trend_summary: Overall industry trend summary
2. growth_rate: Expected annual growth rate (percentage)
3. emerging_roles: Key emerging job roles
4. declining_roles: Roles experiencing decline
5. in_demand_skills: Skills currently in high demand
6. technology_adoption: Adoption of emerging technologies
7. future_outlook: 5-year future outlook for the industry
8. regional_variations: Any significant regional variations

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateIndustryTrendReport = async (industryName: string): Promise<any> => {
  try {
    const prompt = INDUSTRY_TREND_REPORTS_PROMPT(industryName);
    const response = await aiService.generateContent(INDUSTRY_TREND_REPORTS_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Industry trend reports prompt error:', error);
    throw new Error('Failed to generate industry trend report');
  }
};
