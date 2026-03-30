import aiService from '../services/ai.service';

export const LEARNING_PATH_SYSTEM_PROMPT = `
You are an AI learning path designer and education technology expert with deep knowledge of skill acquisition, curriculum design, and learning resources. Your task is to generate comprehensive learning paths for specific skills.
`;

export const LEARNING_PATH_PROMPT = (skillName: string, skillCategory: string): string => `
Generate a comprehensive learning path for ${skillName} in the ${skillCategory} category.

Your response should include:
1. learning_resources: Structured learning resources by difficulty level (beginner, intermediate, advanced)
2. recommended_courses: Array of recommended online courses with platform, duration, and cost
3. practice_exercises: Practice exercises and projects to reinforce learning
4. certifications: Valuable certifications related to this skill
5. estimated_time_hours: Estimated total time to master this skill
6. difficulty_level: Overall difficulty level (beginner, intermediate, advanced)
7. prerequisites: Prerequisite skills or knowledge needed to start

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateLearningPath = async (skillName: string, skillCategory: string): Promise<any> => {
  try {
    const prompt = LEARNING_PATH_PROMPT(skillName, skillCategory);
    const response = await aiService.generateContent(LEARNING_PATH_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Learning path prompt error:', error);
    throw new Error('Failed to generate learning path');
  }
};
