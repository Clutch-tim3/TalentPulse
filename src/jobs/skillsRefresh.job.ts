import { Worker } from 'bullmq';
import prisma from '../config/database';
import scraperOrchestrator from '../scrapers/orchestrator';
import aiService from '../services/ai.service';
import redis from '../config/redis';

const skillsRefreshWorker = new Worker('skills-demand-refresh', async (_job) => {
  console.log('Starting skills demand refresh job');
  
  const staleSkills = await prisma.skillDemand.findMany({
    where: {
      last_refreshed: {
        lte: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    },
  });

  for (const skillDemand of staleSkills) {
    try {
      console.log(`Refreshing skill demand for: ${skillDemand.skill_name} in ${skillDemand.location_filter}`);
      
      const rawData = await scraperOrchestrator.scrapeSkillDemandData([skillDemand.skill_name], skillDemand.location_filter);
      const synthesizedData = await aiService.synthesizeSkillDemand(rawData, skillDemand.location_filter);
      
      await prisma.skillDemand.update({
        where: { id: skillDemand.id },
        data: {
          ...synthesizedData,
          last_refreshed: new Date(),
        },
      });
      
      const cacheKey = `skills:${JSON.stringify({
        skills: skillDemand.skill_name,
        location: skillDemand.location_filter,
      })}`;
      await redis.del(cacheKey);
      
      console.log(`Successfully updated skill demand for: ${skillDemand.skill_name}`);
      
    } catch (error) {
      console.error(`Failed to refresh skill demand for ${skillDemand.skill_name}:`, error);
    }
  }

  console.log(`Skills demand refresh job completed. Updated ${staleSkills.length} skills.`);
  
  return { processed: staleSkills.length };
}, {
  connection: {
    host: process.env.REDIS_URL?.split('@')[1].split(':')[0] || 'localhost',
    port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  },
});

skillsRefreshWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

skillsRefreshWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default skillsRefreshWorker;