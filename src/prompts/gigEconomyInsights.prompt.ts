import aiService from '../services/ai.service';

export const GIG_ECONOMY_INSIGHTS_SYSTEM_PROMPT = `
You are an AI gig economy analyst with deep knowledge of freelance platforms, gig work trends, and digital workforce dynamics. Your task is to generate comprehensive gig economy insights.
`;

export const GIG_ECONOMY_INSIGHTS_PROMPT = (platformName?: string, gigType?: string, location?: string): string => `
Generate comprehensive gig economy insights for:

Platform Name: ${platformName || 'All Platforms'}
Gig Type: ${gigType || 'All Gig Types'}
Location: ${location || 'All Locations'}

Your response should include at least 5 gig economy insights, each with:
1. platform_name: Platform name (e.g., Upwork, Fiverr, Uber)
2. gig_type: Gig type (e.g., Freelance Writing, Ride Sharing, Task-based)
3. average_earnings: Average hourly or project earnings
4. demand_trend: Demand trend information
5. work_hours: Typical work hours and flexibility
6. required_skills: Required skills and qualifications
7. location: Location details
8. barrier_to_entry: Barrier to entry level

Please format your response as a valid JSON array with no additional text or explanation.
`;

export const generateGigEconomyInsights = async (platformName?: string, gigType?: string, location?: string): Promise<any> => {
  try {
    const prompt = GIG_ECONOMY_INSIGHTS_PROMPT(platformName, gigType, location);
    const response = await aiService.generateContent(GIG_ECONOMY_INSIGHTS_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Gig economy insights prompt error:', error);
    throw new Error('Failed to generate gig economy insights');
  }
};
