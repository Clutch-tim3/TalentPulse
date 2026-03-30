import aiService from '../services/ai.service';

export const RESUME_ANALYSIS_SYSTEM_PROMPT = `
You are an AI resume analyzer and career advisor with deep expertise in labor market trends and skills assessment. Your task is to analyze resume text and provide comprehensive, actionable insights.
`;

export const RESUME_ANALYSIS_PROMPT = (resumeText: string): string => `
Analyze the following resume text and provide a comprehensive analysis with the following sections:

1. parsed_data: A structured JSON object containing:
   - personal_info (name, email, phone, location)
   - professional_summary
   - work_experience (array of jobs with company, role, dates, responsibilities, achievements)
   - education (array of degrees with school, degree, dates, GPA if available)
   - skills (array of technical and soft skills)
   - certifications (array of certifications with name, issuer, dates)
   - projects (array of projects with name, description, technologies used)

2. experience_summary: A concise summary of the candidate's overall experience and career trajectory

3. skills_extracted: Array of all skills mentioned in the resume

4. recommended_skills: Array of skills that would enhance the candidate's profile based on their experience

5. certifications: Array of recommended certifications that would boost the candidate's career prospects

6. matched_roles: Array of 3-5 job titles that match the candidate's profile

7. missing_skills: For each matched role, list the skills the candidate is missing

8. matching_score: Overall match score (0-100) indicating how well the candidate's profile matches current job market demand

Resume text:
${resumeText}

Please format your response as a valid JSON object with no additional text or explanation.
`;

export const analyzeResume = async (resumeText: string): Promise<any> => {
  try {
    const prompt = RESUME_ANALYSIS_PROMPT(resumeText);
    const response = await aiService.generateContent(RESUME_ANALYSIS_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Resume analysis prompt error:', error);
    throw new Error('Failed to analyze resume');
  }
};
