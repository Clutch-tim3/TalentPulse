import { Queue, ConnectionOptions } from 'bullmq';

function parseRedisUrl(url: string): ConnectionOptions {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port || '6379', 10),
      ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    };
  } catch {
    console.warn('[bullmq] Could not parse REDIS_URL, using defaults');
    return { host: 'localhost', port: 6379 };
  }
}

const connection = parseRedisUrl(process.env.REDIS_URL || 'redis://localhost:6379');

function createQueue(name: string, limiter: { max: number; duration: number }) {
  const q = new Queue(name, {
    connection,
    ...(process.env.NODE_ENV !== 'development' ? { limiter } : {}),
  });
  q.on('error', (err) => console.warn(`[bullmq:${name}]`, err.message));
  return q;
}

export const skillsDemandRefreshQueue = createQueue('skills-demand-refresh', { max: 1, duration: 60000 });
export const salaryBenchmarkRefreshQueue = createQueue('salary-benchmark-refresh', { max: 1, duration: 120000 });
export const trendingSkillsComputeQueue = createQueue('trending-skills-compute', { max: 1, duration: 30000 });
export const companyHiringRefreshQueue = createQueue('company-hiring-refresh', { max: 1, duration: 60000 });
export const roleIntelligenceRefreshQueue = createQueue('role-intelligence-refresh', { max: 1, duration: 120000 });

export const queues = [
  skillsDemandRefreshQueue,
  salaryBenchmarkRefreshQueue,
  trendingSkillsComputeQueue,
  companyHiringRefreshQueue,
  roleIntelligenceRefreshQueue,
];