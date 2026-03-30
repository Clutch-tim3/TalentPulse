import { PrismaClient } from '@prisma/client';
import { generateGigEconomyInsights } from '../prompts/gigEconomyInsights.prompt';

const prisma = new PrismaClient();

export const gigEconomyInsightsService = {
  async generateGigEconomyInsights(platformName?: string, gigType?: string, location?: string): Promise<any> {
    try {
      const insights = await generateGigEconomyInsights(platformName, gigType, location);
      
      // Create or update gig economy insights in database
      const createdInsights = [];
      for (const insight of insights) {
        try {
          const existingInsight = await prisma.gigEconomyInsight.findFirst({
            where: {
              platform_name: insight.platform_name,
              gig_type: insight.gig_type,
              location: insight.location,
            },
          });

          if (existingInsight) {
            const updatedInsight = await prisma.gigEconomyInsight.update({
              where: { id: existingInsight.id },
              data: {
                average_earnings: insight.average_earnings,
                demand_trend: insight.demand_trend,
                work_hours: insight.work_hours,
                required_skills: insight.required_skills,
                barrier_to_entry: insight.barrier_to_entry,
                last_refreshed: new Date(),
              },
            });
            createdInsights.push(updatedInsight);
          } else {
            const newInsight = await prisma.gigEconomyInsight.create({
              data: {
                platform_name: insight.platform_name,
                gig_type: insight.gig_type,
                average_earnings: insight.average_earnings,
                demand_trend: insight.demand_trend,
                work_hours: insight.work_hours,
                required_skills: insight.required_skills,
                location: insight.location,
                barrier_to_entry: insight.barrier_to_entry,
              },
            });
            createdInsights.push(newInsight);
          }
        } catch (insightError) {
          console.error(`Failed to process insight for ${insight.platform_name}:`, insightError);
        }
      }

      return createdInsights;
    } catch (error) {
      console.error('Gig economy insights generation error:', error);
      throw new Error('Failed to generate gig economy insights');
    }
  },

  async getGigEconomyInsights(platformName?: string, gigType?: string, location?: string): Promise<any> {
    try {
      const where: any = {};
      if (platformName) where.platform_name = platformName;
      if (gigType) where.gig_type = gigType;
      if (location) where.location = location;

      const insights = await prisma.gigEconomyInsight.findMany({
        where,
        orderBy: { last_refreshed: 'desc' },
      });

      return insights;
    } catch (error) {
      console.error('Get gig economy insights error:', error);
      throw new Error('Failed to get gig economy insights');
    }
  },

  async getGigEconomyInsightsByPlatform(platformName: string): Promise<any> {
    try {
      const insights = await prisma.gigEconomyInsight.findMany({
        where: { platform_name: platformName },
        orderBy: { last_refreshed: 'desc' },
      });

      return insights;
    } catch (error) {
      console.error('Get gig economy insights by platform error:', error);
      throw new Error('Failed to get gig economy insights by platform');
    }
  },

  async getGigEconomyInsightsByType(gigType: string): Promise<any> {
    try {
      const insights = await prisma.gigEconomyInsight.findMany({
        where: { gig_type: gigType },
        orderBy: { last_refreshed: 'desc' },
      });

      return insights;
    } catch (error) {
      console.error('Get gig economy insights by type error:', error);
      throw new Error('Failed to get gig economy insights by type');
    }
  },
};
