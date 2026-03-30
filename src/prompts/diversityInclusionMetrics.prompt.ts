import aiService from '../services/ai.service';

export const DIVERSITY_INCLUSION_METRICS_SYSTEM_PROMPT = `
You are an AI diversity and inclusion analyst with deep knowledge of workplace equity, cultural competence, and organizational behavior. Your task is to generate comprehensive diversity and inclusion metrics.
`;

export const DIVERSITY_INCLUSION_METRICS_PROMPT = (companyName: string): string => `
Generate comprehensive diversity and inclusion metrics for:

Company Name: ${companyName}

Your response should include:
1. gender_diversity: Gender diversity metrics and representation
2. ethnic_diversity: Ethnic and racial diversity metrics
3. age_diversity: Age distribution and diversity metrics
4. leadership_diversity: Diversity in leadership positions
5. employee_resource_groups: Information about employee resource groups
6. inclusion_initiatives: Key inclusion initiatives and programs
7. glassdoor_diversity_rating: Estimated Glassdoor diversity rating (1-5)
8. improvement_areas: Areas for potential improvement

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateDiversityMetrics = async (companyName: string): Promise<any> => {
  try {
    const prompt = DIVERSITY_INCLUSION_METRICS_PROMPT(companyName);
    const response = await aiService.generateContent(DIVERSITY_INCLUSION_METRICS_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Diversity metrics prompt error:', error);
    throw new Error('Failed to generate diversity metrics');
  }
};
