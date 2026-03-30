import { PrismaClient } from '@prisma/client';
import { generateGreenJobs } from '../prompts/greenJobsTracker.prompt';

const prisma = new PrismaClient();

export const greenJobsTrackerService = {
  async generateGreenJobs(greenCategory?: string, location?: string): Promise<any> {
    try {
      const greenJobs = await generateGreenJobs(greenCategory, location);
      
      // Create or update green jobs in database
      const createdJobs = [];
      for (const job of greenJobs) {
        try {
          const existingJob = await prisma.greenJob.findFirst({
            where: {
              job_title: job.job_title,
              company_name: job.company_name,
              location: job.location,
            },
          });

          if (existingJob) {
            const updatedJob = await prisma.greenJob.update({
              where: { id: existingJob.id },
              data: {
                green_category: job.green_category,
                sustainability_focus: job.sustainability_focus,
                required_skills: job.required_skills,
                salary_range: job.salary_range,
                remote_available: job.remote_available,
                posted_date: job.posted_date,
                last_refreshed: new Date(),
              },
            });
            createdJobs.push(updatedJob);
          } else {
            const newJob = await prisma.greenJob.create({
              data: {
                job_title: job.job_title,
                company_name: job.company_name,
                location: job.location,
                green_category: job.green_category,
                sustainability_focus: job.sustainability_focus,
                required_skills: job.required_skills,
                salary_range: job.salary_range,
                remote_available: job.remote_available,
                posted_date: job.posted_date,
              },
            });
            createdJobs.push(newJob);
          }
        } catch (jobError) {
          console.error(`Failed to process job ${job.job_title} at ${job.company_name}:`, jobError);
        }
      }

      return createdJobs;
    } catch (error) {
      console.error('Green jobs generation error:', error);
      throw new Error('Failed to generate green jobs');
    }
  },

  async getGreenJobs(greenCategory?: string, location?: string, remoteAvailable?: boolean): Promise<any> {
    try {
      const where: any = {};
      if (greenCategory) where.green_category = greenCategory;
      if (location) where.location = location;
      if (remoteAvailable !== undefined) where.remote_available = remoteAvailable;

      const greenJobs = await prisma.greenJob.findMany({
        where,
        orderBy: { posted_date: 'desc' },
      });

      return greenJobs;
    } catch (error) {
      console.error('Get green jobs error:', error);
      throw new Error('Failed to get green jobs');
    }
  },

  async getGreenJobsByCategory(category: string): Promise<any> {
    try {
      const greenJobs = await prisma.greenJob.findMany({
        where: { green_category: category },
        orderBy: { posted_date: 'desc' },
      });

      return greenJobs;
    } catch (error) {
      console.error('Get green jobs by category error:', error);
      throw new Error('Failed to get green jobs by category');
    }
  },

  async getGreenJobsByLocation(location: string): Promise<any> {
    try {
      const greenJobs = await prisma.greenJob.findMany({
        where: { location: location },
        orderBy: { posted_date: 'desc' },
      });

      return greenJobs;
    } catch (error) {
      console.error('Get green jobs by location error:', error);
      throw new Error('Failed to get green jobs by location');
    }
  },
};
