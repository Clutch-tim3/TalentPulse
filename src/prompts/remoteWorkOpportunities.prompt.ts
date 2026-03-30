import aiService from '../services/ai.service';

export const REMOTE_WORK_OPPORTUNITIES_SYSTEM_PROMPT = `
You are an AI remote work opportunities curator with deep knowledge of remote job markets, company hiring practices, and virtual work trends. Your task is to generate comprehensive remote work opportunities.
`;

export const REMOTE_WORK_OPPORTUNITIES_PROMPT = (jobTitle: string, location: string): string => `
Generate comprehensive remote work opportunities for the following:

Job Title: ${jobTitle}
Location (or "any" for worldwide): ${location}

Your response should include at least 5 remote work opportunities, each with:
1. job_title: Specific job title
2. company_name: Company offering the position
3. location: Location requirements (if any)
4. remote_type: Remote work type (fully remote, hybrid, etc.)
5. salary_range: Estimated salary range (USD)
6. job_description: Brief job description
7. required_skills: Key required skills
8. experience_level: Experience level required
9. posted_date: Estimated posting date (e.g., "2 weeks ago")
10. application_deadline: Application deadline (if known)

Please format your response as a valid JSON array with no additional text or explanation.
`;

export const generateRemoteWorkOpportunities = async (jobTitle: string, location: string): Promise<any> => {
  try {
    const prompt = REMOTE_WORK_OPPORTUNITIES_PROMPT(jobTitle, location);
    const response = await aiService.generateContent(REMOTE_WORK_OPPORTUNITIES_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Remote work opportunities prompt error:', error);
    throw new Error('Failed to generate remote work opportunities');
  }
};
