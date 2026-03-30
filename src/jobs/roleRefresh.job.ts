import { Worker } from 'bullmq';
import prisma from '../config/database';
import scraperOrchestrator from '../scrapers/orchestrator';
import aiService from '../services/ai.service';
import redis from '../config/redis';

const roleRefreshWorker = new Worker('role-intelligence-refresh', async (_job) => {
  console.log('Starting role intelligence refresh job');
  
  const staleRoles = await prisma.roleIntelligence.findMany({
    where: {
      last_refreshed: {
        lte: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  for (const role of staleRoles) {
    try {
      console.log(`Refreshing role intelligence for: ${role.job_title_normalised}`);
      
      const rawData = await scraperOrchestrator.scrapeJobData(role.job_title_normalised, '', 10);
      const synthesizedData = await aiService.synthesizeRoleIntelligence(rawData);
      
      await prisma.roleIntelligence.update({
        where: { id: role.id },
        data: {
          ...synthesizedData,
          last_refreshed: new Date(),
        },
      });
      
      const cacheKey = `roles:${JSON.stringify({
        job_title: role.job_title_normalised,
      })}`;
      await redis.del(cacheKey);
      
      console.log(`Successfully updated role intelligence for: ${role.job_title_normalised}`);
      
    } catch (error) {
      console.error(`Failed to refresh role intelligence for ${role.job_title_normalised}:`, error);
    }
  }

  console.log(`Role intelligence refresh job completed. Updated ${staleRoles.length} roles.`);
  
  return { processed: staleRoles.length };
}, {
  connection: {
    host: process.env.REDIS_URL?.split('@')[1].split(':')[0] || 'localhost',
    port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  },
});

roleRefreshWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

roleRefreshWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default roleRefreshWorker;