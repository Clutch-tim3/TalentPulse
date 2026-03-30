import { PrismaClient } from '@prisma/client';
import { generateCareerPath } from '../prompts/careerPath.prompt';

const prisma = new PrismaClient();

export const careerPathService = {
  async generateCareerPath(currentRole: string, targetRole: string): Promise<any> {
    try {
      const careerPath = await generateCareerPath(currentRole, targetRole);
      
      const savedCareerPath = await prisma.careerPath.create({
        data: {
          current_role: currentRole,
          target_role: targetRole,
          transition_timeline: careerPath.transition_timeline,
          required_skills: careerPath.required_skills,
          learning_paths: careerPath.learning_paths,
          experience_required: careerPath.experience_required,
          education_required: careerPath.education_required,
          certifications: careerPath.certifications,
          salary_progression: careerPath.salary_progression,
          job_market_insights: careerPath.job_market_insights,
        },
      });

      return savedCareerPath;
    } catch (error) {
      console.error('Career path generation error:', error);
      throw new Error('Failed to generate career path');
    }
  },

  async getCareerPath(currentRole: string, targetRole: string): Promise<any> {
    try {
      const careerPath = await prisma.careerPath.findFirst({
        where: { current_role: currentRole, target_role: targetRole },
        orderBy: { last_refreshed: 'desc' },
      });
      
      if (!careerPath) {
        throw new Error('Career path not found');
      }
      
      return careerPath;
    } catch (error) {
      console.error('Get career path error:', error);
      throw new Error('Failed to get career path');
    }
  },
};
