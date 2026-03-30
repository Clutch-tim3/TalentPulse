import { PrismaClient } from '@prisma/client';
import { generateLearningPath } from '../prompts/learningPath.prompt';

const prisma = new PrismaClient();

export const learningPathService = {
  async generateLearningPath(skillName: string, skillCategory: string): Promise<any> {
    try {
      const learningPath = await generateLearningPath(skillName, skillCategory);
      
      const savedLearningPath = await prisma.learningPath.create({
        data: {
          skill_name: skillName,
          skill_category: skillCategory,
          learning_resources: learningPath.learning_resources,
          recommended_courses: learningPath.recommended_courses,
          practice_exercises: learningPath.practice_exercises,
          certifications: learningPath.certifications,
          estimated_time_hours: learningPath.estimated_time_hours,
          difficulty_level: learningPath.difficulty_level,
          prerequisites: learningPath.prerequisites,
        },
      });

      return savedLearningPath;
    } catch (error) {
      console.error('Learning path generation error:', error);
      throw new Error('Failed to generate learning path');
    }
  },

  async getLearningPath(skillName: string): Promise<any> {
    try {
      const learningPath = await prisma.learningPath.findFirst({
        where: { skill_name: skillName },
        orderBy: { last_refreshed: 'desc' },
      });
      
      if (!learningPath) {
        throw new Error('Learning path not found');
      }
      
      return learningPath;
    } catch (error) {
      console.error('Get learning path error:', error);
      throw new Error('Failed to get learning path');
    }
  },

  async getLearningPathsByCategory(category: string): Promise<any> {
    try {
      const learningPaths = await prisma.learningPath.findMany({
        where: { skill_category: category },
        orderBy: { skill_name: 'asc' },
      });
      
      return learningPaths;
    } catch (error) {
      console.error('Get learning paths by category error:', error);
      throw new Error('Failed to get learning paths by category');
    }
  },
};
