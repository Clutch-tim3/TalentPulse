import { PrismaClient } from '@prisma/client';
import { generateSalaryPrediction } from '../prompts/salaryPredictor.prompt';

const prisma = new PrismaClient();

export const salaryPredictorService = {
  async generateSalaryPrediction(jobTitle: string, location: string, experienceLevel: string, educationLevel: string, skills: string[], certifications: string[]): Promise<any> {
    try {
      const prediction = await generateSalaryPrediction(jobTitle, location, experienceLevel, educationLevel, skills, certifications);
      
      const savedPrediction = await prisma.salaryPrediction.create({
        data: {
          job_title: jobTitle,
          location: location,
          experience_level: experienceLevel,
          education_level: educationLevel,
          skills: skills,
          certifications: certifications,
          predicted_salary: prediction.predicted_salary,
          salary_range: prediction.salary_range,
          confidence_score: prediction.confidence_score,
          market_trends: prediction.market_trends,
        },
      });

      return savedPrediction;
    } catch (error) {
      console.error('Salary prediction generation error:', error);
      throw new Error('Failed to generate salary prediction');
    }
  },

  async getSalaryPredictions(jobTitle?: string, location?: string, experienceLevel?: string): Promise<any> {
    try {
      const where: any = {};
      if (jobTitle) where.job_title = { contains: jobTitle, mode: 'insensitive' };
      if (location) where.location = { contains: location, mode: 'insensitive' };
      if (experienceLevel) where.experience_level = experienceLevel;

      const predictions = await prisma.salaryPrediction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return predictions;
    } catch (error) {
      console.error('Get salary predictions error:', error);
      throw new Error('Failed to get salary predictions');
    }
  },

  async getPredictionByJobTitleAndLocation(jobTitle: string, location: string): Promise<any> {
    try {
      const prediction = await prisma.salaryPrediction.findFirst({
        where: {
          job_title: { contains: jobTitle, mode: 'insensitive' },
          location: { contains: location, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!prediction) {
        throw new Error('Salary prediction not found');
      }

      return prediction;
    } catch (error) {
      console.error('Get salary prediction by job title and location error:', error);
      throw new Error('Failed to get salary prediction');
    }
  },
};
