import aiService from '../services/ai.service';

export const FREELANCE_RATES_SYSTEM_PROMPT = `
You are an AI freelance rates analyst with deep knowledge of the gig economy, freelance market trends, and compensation standards. Your task is to generate comprehensive freelance rate data.
`;

export const FREELANCE_RATES_PROMPT = (skillName: string, skillCategory: string, location: string, experienceLevel: string): string => `
Generate comprehensive freelance rates for the following:

Skill Name: ${skillName}
Skill Category: ${skillCategory}
Location: ${location}
Experience Level: ${experienceLevel}

Your response should include:
1. hourly_rate_min: Minimum hourly rate (USD)
2. hourly_rate_median: Median hourly rate (USD)
3. hourly_rate_max: Maximum hourly rate (USD)
4. project_rate_min: Minimum project rate (USD)
5. project_rate_median: Median project rate (USD)
6. project_rate_max: Maximum project rate (USD)
7. demand_score: Demand score (0-100) indicating current demand
8. remote_availability: Whether this skill is commonly available for remote freelance work

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateFreelanceRates = async (skillName: string, skillCategory: string, location: string, experienceLevel: string): Promise<any> => {
  try {
    const prompt = FREELANCE_RATES_PROMPT(skillName, skillCategory, location, experienceLevel);
    const response = await aiService.generateContent(FREELANCE_RATES_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Freelance rates prompt error:', error);
    throw new Error('Failed to generate freelance rates');
  }
};
