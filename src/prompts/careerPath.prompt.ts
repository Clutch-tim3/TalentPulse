import aiService from '../services/ai.service';

export const CAREER_PATH_SYSTEM_PROMPT = `
You are an AI career coach and workforce development expert with deep knowledge of career progression, skill requirements, and job market trends. Your task is to generate comprehensive career paths.
`;

export const CAREER_PATH_PROMPT = (currentRole: string, targetRole: string): string => `
Generate a comprehensive career path from ${currentRole} to ${targetRole}.

Your response should include:
1. transition_timeline: Estimated time to transition to each role level
2. required_skills: Array of skills needed to transition
3. learning_paths: Structured learning paths with resources and timelines
4. experience_required: Recommended experience for each stage
5. education_required: Educational requirements or recommendations
6. certifications: Valuable certifications to pursue
7. salary_progression: Estimated salary progression along the path
8. job_market_insights: Job market trends and demand for each role

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateCareerPath = async (currentRole: string, targetRole: string): Promise<any> => {
  try {
    const prompt = CAREER_PATH_PROMPT(currentRole, targetRole);
    const response = await aiService.generateContent(CAREER_PATH_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Career path prompt error:', error);
    throw new Error('Failed to generate career path');
  }
};
