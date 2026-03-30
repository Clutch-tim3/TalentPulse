import aiService from '../services/ai.service';

export const GREEN_JOBS_TRACKER_SYSTEM_PROMPT = `
You are an AI green jobs analyst with deep knowledge of renewable energy, sustainability practices, and environmental sectors. Your task is to generate comprehensive green jobs data.
`;

export const GREEN_JOBS_TRACKER_PROMPT = (greenCategory?: string, location?: string): string => `
Generate comprehensive green jobs data for:

Green Category: ${greenCategory || 'All Green Jobs'}
Location: ${location || 'All Locations'}

Your response should include at least 5 green jobs, each with:
1. job_title: Job title (e.g., Solar Engineer, Sustainability Consultant)
2. company_name: Company name
3. location: Location (city, country)
4. green_category: Green category (e.g., Renewable Energy, Circular Economy)
5. sustainability_focus: Key sustainability focus areas
6. required_skills: Required skills and qualifications
7. salary_range: Salary range information
8. remote_available: Whether remote work is available (true/false)
9. posted_date: Date the job was posted

Please format your response as a valid JSON array with no additional text or explanation.
`;

export const generateGreenJobs = async (greenCategory?: string, location?: string): Promise<any> => {
  try {
    const prompt = GREEN_JOBS_TRACKER_PROMPT(greenCategory, location);
    const response = await aiService.generateContent(GREEN_JOBS_TRACKER_SYSTEM_PROMPT, prompt);
    return aiService.parseJSONResponse(response);
  } catch (error) {
    console.error('Green jobs tracker prompt error:', error);
    throw new Error('Failed to generate green jobs');
  }
};
