import { Worker } from 'bullmq';
import prisma from '../config/database';
import scraperOrchestrator from '../scrapers/orchestrator';
import aiService from '../services/ai.service';
import redis from '../config/redis';

const companyRefreshWorker = new Worker('company-hiring-refresh', async (_job) => {
  console.log('Starting company hiring profile refresh job');
  
  const staleProfiles = await prisma.companyHiringProfile.findMany({
    where: {
      last_refreshed: {
        lte: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      createdAt: {
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    },
  });

  for (const profile of staleProfiles) {
    try {
      console.log(`Refreshing hiring profile for: ${profile.company_name}`);
      
      const rawData = await scraperOrchestrator.scrapeJobData('*', '', 10);
      const synthesizedData = await aiService.synthesizeRoleIntelligence(rawData);
      
      await prisma.companyHiringProfile.update({
        where: { id: profile.id },
        data: {
          ...synthesizedData,
          last_refreshed: new Date(),
        },
      });
      
      const cacheKey = `company:${JSON.stringify({
        company: profile.company_name,
      })}`;
      await redis.del(cacheKey);
      
      console.log(`Successfully updated hiring profile for: ${profile.company_name}`);
      
    } catch (error) {
      console.error(`Failed to refresh hiring profile for ${profile.company_name}:`, error);
    }
  }

  console.log(`Company hiring profile refresh job completed. Updated ${staleProfiles.length} profiles.`);
  
  return { processed: staleProfiles.length };
}, {
  connection: {
    host: process.env.REDIS_URL?.split('@')[1].split(':')[0] || 'localhost',
    port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  },
});

companyRefreshWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

companyRefreshWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default companyRefreshWorker;