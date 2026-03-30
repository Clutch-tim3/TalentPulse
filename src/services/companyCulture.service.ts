import { PrismaClient } from '@prisma/client';
import { generateCompanyCulture } from '../prompts/companyCulture.prompt';

const prisma = new PrismaClient();

export const companyCultureService = {
  async generateCompanyCulture(companyName: string): Promise<any> {
    try {
      const culture = await generateCompanyCulture(companyName);
      
      const savedCulture = await prisma.companyCulture.create({
        data: {
          company_name: companyName,
          culture_summary: culture.culture_summary,
          work_life_balance: culture.work_life_balance,
          career_growth: culture.career_growth,
          compensation: culture.compensation,
          management_quality: culture.management_quality,
          company_values: culture.company_values,
          employee_reviews: culture.employee_reviews,
          interview_experience: culture.interview_experience,
          glassdoor_rating: culture.glassdoor_rating,
        },
      });

      return savedCulture;
    } catch (error) {
      console.error('Company culture generation error:', error);
      throw new Error('Failed to generate company culture insights');
    }
  },

  async getCompanyCulture(companyName: string): Promise<any> {
    try {
      const culture = await prisma.companyCulture.findFirst({
        where: { company_name: companyName },
        orderBy: { last_refreshed: 'desc' },
      });
      
      if (!culture) {
        throw new Error('Company culture not found');
      }
      
      return culture;
    } catch (error) {
      console.error('Get company culture error:', error);
      throw new Error('Failed to get company culture');
    }
  },
};
