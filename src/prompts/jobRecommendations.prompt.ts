import aiService from '../services/ai.service';

export const JOB_RECOMMENDATIONS_SYSTEM_PROMPT = `
You are an AI career advisor and job matching expert with deep knowledge of labor market trends, industry requirements, and job search strategies. Your task is to generate personalized job recommendations based on user profiles.
`;

export const JOB_RECOMMENDATIONS_PROMPT = (userProfile: any): string => `
Generate personalized job recommendations based on the following user profile:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Your response should include:
1. recommended_jobs: Array of 5-7 job titles that match the user's profile
2. job_matches: For each recommended job, provide a match score (0-100) and explanation
3. skills_alignment: Analysis of how the user's skills match the required skills for each job
4. salary_range: Estimated salary range for each recommended job
5. growth_opportunities: Information about career growth prospects for each job

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateJobRecommendations = async (userProfile: any): Promise<any> => {
  try {
    const prompt = JOB_RECOMMENDATIONS_PROMPT(userProfile);
    const response = await aiService.generateContent(JOB_RECOMMENDATIONS_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Job recommendations prompt error:', error);
    throw new Error('Failed to generate job recommendations');
  }
};
