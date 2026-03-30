import aiService from '../services/ai.service';

export const JOB_MARKET_ALERTS_SYSTEM_PROMPT = `
You are an AI job market research analyst with deep knowledge of hiring trends, job postings, and labor market dynamics. Your task is to generate comprehensive job market alert content.
`;

export const JOB_MARKET_ALERTS_PROMPT = (searchCriteria: any): string => `
Generate comprehensive job market alert content based on the following search criteria:

${JSON.stringify(searchCriteria, null, 2)}

Your response should include:
1. market_overview: Brief overview of current job market conditions
2. relevant_job_postings: Array of at least 3 relevant job postings with details
3. skills_in_demand: Key skills in high demand for these roles
4. salary_range: Typical salary range for these positions
5. hiring_trends: Current hiring trends affecting this job market
6. recommended_actions: Recommended actions for job seekers

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateJobMarketAlerts = async (searchCriteria: any): Promise<any> => {
  try {
    const prompt = JOB_MARKET_ALERTS_PROMPT(searchCriteria);
    const response = await aiService.generateContent(JOB_MARKET_ALERTS_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Job market alerts prompt error:', error);
    throw new Error('Failed to generate job market alerts');
  }
};
