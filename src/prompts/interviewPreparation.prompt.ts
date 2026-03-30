import aiService from '../services/ai.service';

export const INTERVIEW_PREPARATION_SYSTEM_PROMPT = `
You are an AI interview preparation expert with deep knowledge of interview processes, question types, and company research. Your task is to generate comprehensive interview preparation materials.
`;

export const INTERVIEW_PREPARATION_PROMPT = (jobTitle: string, companyName: string): string => `
Generate comprehensive interview preparation materials for the following role:

Job Title: ${jobTitle}
Company Name: ${companyName}

Your response should include:
1. common_questions: Array of 10 common interview questions for this role
2. technical_questions: Array of 5-7 technical interview questions (if applicable)
3. behavioral_questions: Array of 5 behavioral interview questions
4. company_research: Important company information to research and understand
5. role_preparation: Key areas to focus on for role-specific preparation
6. recommended_questions: Questions the candidate should ask the interviewer

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateInterviewQuestions = async (jobTitle: string, companyName: string): Promise<any> => {
  try {
    const prompt = INTERVIEW_PREPARATION_PROMPT(jobTitle, companyName);
    const response = await aiService.generateContent(INTERVIEW_PREPARATION_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Interview preparation prompt error:', error);
    throw new Error('Failed to generate interview questions');
  }
};
