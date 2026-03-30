import { Worker } from 'bullmq';
import prisma from '../config/database';
import scraperOrchestrator from '../scrapers/orchestrator';
import aiService from '../services/ai.service';
import redis from '../config/redis';

const salaryRefreshWorker = new Worker('salary-benchmark-refresh', async (_job) => {
  console.log('Starting salary benchmark refresh job');
  
  const staleBenchmarks = await prisma.salaryBenchmark.findMany({
    where: {
      last_refreshed: {
        lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      createdAt: {
        gte: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
    },
  });

  for (const benchmark of staleBenchmarks) {
    try {
      console.log(`Refreshing salary benchmark for: ${benchmark.job_title_normalised} in ${benchmark.location}`);
      
      const rawData = await scraperOrchestrator.scrapeSalaryData(benchmark.job_title_normalised, benchmark.location);
      const synthesizedData = await aiService.synthesizeSalaryData(rawData);
      
      await prisma.salaryBenchmark.update({
        where: { id: benchmark.id },
        data: {
          ...synthesizedData,
          last_refreshed: new Date(),
        },
      });
      
      const cacheKey = `salary:${JSON.stringify({
        job_title: benchmark.job_title_normalised,
        location: benchmark.location,
        experience_level: benchmark.experience_level,
      })}`;
      await redis.del(cacheKey);
      
      console.log(`Successfully updated salary benchmark for: ${benchmark.job_title_normalised}`);
      
    } catch (error) {
      console.error(`Failed to refresh salary benchmark for ${benchmark.job_title_normalised}:`, error);
    }
  }

  console.log(`Salary benchmark refresh job completed. Updated ${staleBenchmarks.length} benchmarks.`);
  
  return { processed: staleBenchmarks.length };
}, {
  connection: {
    host: process.env.REDIS_URL?.split('@')[1].split(':')[0] || 'localhost',
    port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  },
});

salaryRefreshWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

salaryRefreshWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default salaryRefreshWorker;