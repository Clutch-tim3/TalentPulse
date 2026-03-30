import { PrismaClient } from '@prisma/client';
import { generateFreelanceRates } from '../prompts/freelanceRates.prompt';

const prisma = new PrismaClient();

export const freelanceRatesService = {
  async generateFreelanceRates(skillName: string, skillCategory: string, location: string, experienceLevel: string): Promise<any> {
    try {
      const rates = await generateFreelanceRates(skillName, skillCategory, location, experienceLevel);
      
      const savedRates = await prisma.freelanceRate.create({
        data: {
          skill_name: skillName,
          skill_category: skillCategory,
          hourly_rate_min: rates.hourly_rate_min,
          hourly_rate_median: rates.hourly_rate_median,
          hourly_rate_max: rates.hourly_rate_max,
          project_rate_min: rates.project_rate_min,
          project_rate_median: rates.project_rate_median,
          project_rate_max: rates.project_rate_max,
          location: location,
          experience_level: experienceLevel,
          demand_score: rates.demand_score,
          remote_availability: rates.remote_availability,
        },
      });

      return savedRates;
    } catch (error) {
      console.error('Freelance rates generation error:', error);
      throw new Error('Failed to generate freelance rates');
    }
  },

  async getFreelanceRates(skillName?: string, location?: string, experienceLevel?: string): Promise<any> {
    try {
      const where: any = {};
      if (skillName) where.skill_name = { contains: skillName, mode: 'insensitive' };
      if (location) where.location = { contains: location, mode: 'insensitive' };
      if (experienceLevel) where.experience_level = experienceLevel;

      const rates = await prisma.freelanceRate.findMany({
        where,
        orderBy: { skill_name: 'asc' },
      });

      return rates;
    } catch (error) {
      console.error('Get freelance rates error:', error);
      throw new Error('Failed to get freelance rates');
    }
  },

  async getFreelanceRatesByCategory(category: string): Promise<any> {
    try {
      const rates = await prisma.freelanceRate.findMany({
        where: { skill_category: category },
        orderBy: { skill_name: 'asc' },
      });

      return rates;
    } catch (error) {
      console.error('Get freelance rates by category error:', error);
      throw new Error('Failed to get freelance rates by category');
    }
  },
};
