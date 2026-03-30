import { PrismaClient } from '@prisma/client';
import { generateNegotiationStrategy } from '../prompts/salaryNegotiation.prompt';

const prisma = new PrismaClient();

export const salaryNegotiationService = {
  async generateStrategy(jobTitle: string, location: string, experienceLevel: string, currentSalary: number, offerSalary: number): Promise<any> {
    try {
      const strategy = await generateNegotiationStrategy(jobTitle, location, experienceLevel, currentSalary, offerSalary);
      
      const savedStrategy = await prisma.salaryNegotiation.create({
        data: {
          job_title: jobTitle,
          location: location,
          experience_level: experienceLevel,
          current_salary: currentSalary,
          offer_salary: offerSalary,
          counteroffer_strategy: strategy.counteroffer_strategy,
          negotiation_tips: strategy.negotiation_tips,
          market_data: strategy.market_data,
          salary_range: strategy.salary_range,
        },
      });

      return savedStrategy;
    } catch (error) {
      console.error('Salary negotiation error:', error);
      throw new Error('Failed to generate negotiation strategy');
    }
  },

  async getStrategy(jobTitle: string, location: string, experienceLevel: string): Promise<any> {
    try {
      const strategy = await prisma.salaryNegotiation.findFirst({
        where: { job_title: jobTitle, location: location, experience_level: experienceLevel },
        orderBy: { last_refreshed: 'desc' },
      });
      
      if (!strategy) {
        throw new Error('Negotiation strategy not found');
      }
      
      return strategy;
    } catch (error) {
      console.error('Get negotiation strategy error:', error);
      throw new Error('Failed to get negotiation strategy');
    }
  },
};
