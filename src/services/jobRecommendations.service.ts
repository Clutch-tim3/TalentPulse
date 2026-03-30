import { PrismaClient } from '@prisma/client';
import { generateJobRecommendations } from '../prompts/jobRecommendations.prompt';

const prisma = new PrismaClient();

const generateProfileHash = (profile: any): string => {
  return require('crypto').createHash('sha256').update(JSON.stringify(profile)).digest('hex');
};

export const jobRecommendationsService = {
  async generateRecommendations(userProfile: any): Promise<any> {
    try {
      const recommendations = await generateJobRecommendations(userProfile);
      
      const savedRecommendations = await prisma.jobRecommendation.create({
        data: {
          user_profile_hash: generateProfileHash(userProfile),
          recommended_jobs: recommendations.recommended_jobs,
          job_matches: recommendations.job_matches,
          skills_alignment: recommendations.skills_alignment,
          location_preference: userProfile.location_preference || 'global',
          experience_level: userProfile.experience_level || 'mid',
          industry_preference: userProfile.industry_preference || 'all',
          salary_expectation: userProfile.salary_expectation,
        },
      });

      return savedRecommendations;
    } catch (error) {
      console.error('Job recommendations error:', error);
      throw new Error('Failed to generate job recommendations');
    }
  },

  async getRecommendations(profileHash: string): Promise<any> {
    try {
      const recommendations = await prisma.jobRecommendation.findFirst({
        where: { user_profile_hash: profileHash },
        orderBy: { last_refreshed: 'desc' },
      });
      
      if (!recommendations) {
        throw new Error('Job recommendations not found');
      }
      
      return recommendations;
    } catch (error) {
      console.error('Get job recommendations error:', error);
      throw new Error('Failed to get job recommendations');
    }
  },
};
