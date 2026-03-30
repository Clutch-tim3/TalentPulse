import aiService from '../services/ai.service';

export const SALARY_NEGOTIATION_SYSTEM_PROMPT = `
You are an AI salary negotiation expert with deep knowledge of compensation packages, market trends, and negotiation strategies. Your task is to provide comprehensive salary negotiation guidance.
`;

export const SALARY_NEGOTIATION_PROMPT = (jobTitle: string, location: string, experienceLevel: string, currentSalary: number, offerSalary: number): string => `
Generate a comprehensive salary negotiation strategy for the following scenario:

Job Title: ${jobTitle}
Location: ${location}
Experience Level: ${experienceLevel}
Current Salary: $${currentSalary.toLocaleString()}
Offer Salary: $${offerSalary.toLocaleString()}

Your response should include:
1. counteroffer_strategy: Detailed counteroffer strategy with recommended range and reasoning
2. negotiation_tips: Practical negotiation tips tailored to this scenario
3. market_data: Salary market data and benchmarks for this role and location
4. salary_range: Recommended salary range based on market research
5. benefits_negotiation: Guidance on negotiating additional benefits and perks

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateNegotiationStrategy = async (jobTitle: string, location: string, experienceLevel: string, currentSalary: number, offerSalary: number): Promise<any> => {
  try {
    const prompt = SALARY_NEGOTIATION_PROMPT(jobTitle, location, experienceLevel, currentSalary, offerSalary);
    const response = await aiService.generateContent(SALARY_NEGOTIATION_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Salary negotiation prompt error:', error);
    throw new Error('Failed to generate negotiation strategy');
  }
};
