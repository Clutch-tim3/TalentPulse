import { Worker } from 'bullmq';
import prisma from '../config/database';

const calculateTrend = (historicalData: any[], days: number): number | null => {
  const current = historicalData[0];
  const relevantData = historicalData.filter(d => {
    const daysDiff = (current.last_refreshed.getTime() - d.last_refreshed.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  });
  
  if (relevantData.length < 2) {
    return null;
  }
  
  const oldest = relevantData[relevantData.length - 1];
  const percentageChange = ((current.demand_score - oldest.demand_score) / oldest.demand_score) * 100;
  return parseFloat(percentageChange.toFixed(1));
};

const determineTrend = (trendPct: number | null): string => {
  if (!trendPct) return 'stable';
  if (trendPct > 10) return 'rising';
  if (trendPct < -10) return 'declining';
  return 'stable';
};

const trendingComputeWorker = new Worker('trending-skills-compute', async (_job) => {
  console.log('Starting trending skills compute job');
  
  const allSkills = await prisma.skillDemand.findMany();
  
  for (const skill of allSkills) {
    try {
      console.log(`Calculating trends for: ${skill.skill_name} in ${skill.location_filter}`);
      
      const historicalData = await prisma.skillDemand.findMany({
        where: {
          skill_name: skill.skill_name,
          location_filter: skill.location_filter,
        },
        orderBy: {
          last_refreshed: 'desc',
        },
        take: 30,
      });

      if (historicalData.length > 1) {
        const trend30d = calculateTrend(historicalData, 30);
        const trend90d = calculateTrend(historicalData, 90);
        
        await prisma.skillDemand.update({
          where: { id: skill.id },
          data: {
            trend_pct_30d: trend30d,
            trend_pct_90d: trend90d,
            demand_trend: determineTrend(trend30d),
          },
        });
        
        console.log(`Updated trends for: ${skill.skill_name}`);
      }
      
    } catch (error) {
      console.error(`Failed to calculate trends for ${skill.skill_name}:`, error);
    }
  }

  console.log(`Trending skills compute job completed. Calculated trends for ${allSkills.length} skills.`);
  
  return { processed: allSkills.length };
}, {
  connection: {
    host: process.env.REDIS_URL?.split('@')[1].split(':')[0] || 'localhost',
    port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  },
});

trendingComputeWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

trendingComputeWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default trendingComputeWorker;