import { PrismaClient } from '@prisma/client';
import { generateRemoteWorkOpportunities } from '../prompts/remoteWorkOpportunities.prompt';

const prisma = new PrismaClient();

export const remoteWorkOpportunitiesService = {
  async generateRemoteWorkOpportunities(jobTitle: string, location: string): Promise<any> {
    try {
      const opportunities = await generateRemoteWorkOpportunities(jobTitle, location);
      
      const savedOpportunities = await prisma.remoteWorkOpportunity.createMany({
        data: opportunities.map((opportunity: any) => ({
          job_title: opportunity.job_title,
          company_name: opportunity.company_name,
          location: opportunity.location,
          remote_type: opportunity.remote_type,
          salary_range: opportunity.salary_range,
          job_description: opportunity.job_description,
          required_skills: opportunity.required_skills,
          experience_level: opportunity.experience_level,
          posted_date: opportunity.posted_date,
          application_deadline: opportunity.application_deadline,
        })),
      });

      return savedOpportunities;
    } catch (error) {
      console.error('Remote work opportunities generation error:', error);
      throw new Error('Failed to generate remote work opportunities');
    }
  },

  async getRemoteWorkOpportunities(jobTitle?: string, location?: string): Promise<any> {
    try {
      const where: any = {};
      if (jobTitle) where.job_title = { contains: jobTitle, mode: 'insensitive' };
      if (location) where.location = { contains: location, mode: 'insensitive' };

      const opportunities = await prisma.remoteWorkOpportunity.findMany({
        where,
        orderBy: { posted_date: 'desc' },
        take: 50,
      });

      return opportunities;
    } catch (error) {
      console.error('Get remote work opportunities error:', error);
      throw new Error('Failed to get remote work opportunities');
    }
  },

  async getRemoteWorkOpportunitiesBySkill(skill: string): Promise<any> {
    try {
      const opportunities = await prisma.remoteWorkOpportunity.findMany({
        where: {
          required_skills: { has: skill },
        },
        orderBy: { posted_date: 'desc' },
        take: 50,
      });

      return opportunities;
    } catch (error) {
      console.error('Get remote work opportunities by skill error:', error);
      throw new Error('Failed to get remote work opportunities by skill');
    }
  },
};
