import aiService from '../services/ai.service';

export const COMPANY_CULTURE_SYSTEM_PROMPT = `
You are an AI company culture analyst with deep knowledge of organizational behavior, workplace dynamics, and employee experience. Your task is to generate comprehensive company culture insights.
`;

export const COMPANY_CULTURE_PROMPT = (companyName: string): string => `
Generate comprehensive company culture insights for ${companyName}.

Your response should include:
1. culture_summary: Overall company culture summary
2. work_life_balance: Work-life balance rating and description
3. career_growth: Career growth and development opportunities
4. compensation: Compensation and benefits information
5. management_quality: Management and leadership quality
6. company_values: Core company values and how they're practiced
7. employee_reviews: Key themes from employee reviews
8. interview_experience: Typical interview experience and process
9. glassdoor_rating: Estimated Glassdoor rating (1-5)

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateCompanyCulture = async (companyName: string): Promise<any> => {
  try {
    const prompt = COMPANY_CULTURE_PROMPT(companyName);
    const response = await aiService.generateContent(COMPANY_CULTURE_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Company culture prompt error:', error);
    throw new Error('Failed to generate company culture insights');
  }
};
