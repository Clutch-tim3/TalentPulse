import { PrismaClient } from '@prisma/client';
import { generateDiversityMetrics } from '../prompts/diversityInclusionMetrics.prompt';

const prisma = new PrismaClient();

export const diversityInclusionMetricsService = {
  async generateDiversityMetrics(companyName: string): Promise<any> {
    try {
      const metrics = await generateDiversityMetrics(companyName);
      
      const savedMetrics = await prisma.diversityMetric.create({
        data: {
          company_name: companyName,
          gender_diversity: metrics.gender_diversity,
          ethnic_diversity: metrics.ethnic_diversity,
          age_diversity: metrics.age_diversity,
          leadership_diversity: metrics.leadership_diversity,
          employee_resource_groups: metrics.employee_resource_groups,
          inclusion_initiatives: metrics.inclusion_initiatives,
          glassdoor_diversity_rating: metrics.glassdoor_diversity_rating,
        },
      });

      return savedMetrics;
    } catch (error) {
      console.error('Diversity metrics generation error:', error);
      throw new Error('Failed to generate diversity metrics');
    }
  },

  async getDiversityMetrics(companyName?: string): Promise<any> {
    try {
      const where: any = {};
      if (companyName) where.company_name = { contains: companyName, mode: 'insensitive' };

      const metrics = await prisma.diversityMetric.findMany({
        where,
        orderBy: { last_refreshed: 'desc' },
      });

      return metrics;
    } catch (error) {
      console.error('Get diversity metrics error:', error);
      throw new Error('Failed to get diversity metrics');
    }
  },

  async getDiversityMetricsByCompany(companyName: string): Promise<any> {
    try {
      const metrics = await prisma.diversityMetric.findFirst({
        where: { company_name: { contains: companyName, mode: 'insensitive' } },
        orderBy: { last_refreshed: 'desc' },
      });

      if (!metrics) {
        throw new Error('Diversity metrics not found');
      }

      return metrics;
    } catch (error) {
      console.error('Get diversity metrics by company error:', error);
      throw new Error('Failed to get diversity metrics');
    }
  },
};
