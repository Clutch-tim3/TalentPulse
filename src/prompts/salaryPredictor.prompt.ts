import aiService from '../services/ai.service';

export const SALARY_PREDICTOR_SYSTEM_PROMPT = `
You are an AI salary prediction expert with deep knowledge of compensation trends, labor market dynamics, and machine learning models. Your task is to generate comprehensive salary predictions.
`;

export const SALARY_PREDICTOR_PROMPT = (jobTitle: string, location: string, experienceLevel: string, educationLevel: string, skills: string[], certifications: string[]): string => `
Generate comprehensive salary prediction for the following profile:

Job Title: ${jobTitle}
Location: ${location}
Experience Level: ${experienceLevel}
Education Level: ${educationLevel}
Skills: ${skills.join(', ')}
Certifications: ${certifications.join(', ')}

Your response should include:
1. predicted_salary: Predicted annual salary (USD)
2. salary_range: Salary range (minimum and maximum)
3. confidence_score: Confidence score (0-100)
4. market_trends: Key market trends affecting salary expectations
5. influencing_factors: Factors that influence this salary prediction

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const generateSalaryPrediction = async (jobTitle: string, location: string, experienceLevel: string, educationLevel: string, skills: string[], certifications: string[]): Promise<any> => {
  try {
    const prompt = SALARY_PREDICTOR_PROMPT(jobTitle, location, experienceLevel, educationLevel, skills, certifications);
    const response = await aiService.generateContent(SALARY_PREDICTOR_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Salary predictor prompt error:', error);
    throw new Error('Failed to generate salary prediction');
  }
};
