import { Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';

interface HealthCheck {
  service: string;
  version: string;
  status: string;
  timestamp: string;
  checks: {
    database?: { status: string; response_time_ms?: number; error?: string };
    redis?: { status: string; response_time_ms?: number; error?: string };
  };
}

export const getHealth = async (req: Request, res: Response) => {
  const health: HealthCheck = {
    service: 'talentpulse-api',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    health.checks.database = await checkDatabase();
  } catch (error) {
    health.checks.database = { status: 'failed', error: (error as Error).message };
    health.status = 'degraded';
  }

  // Redis is optional — its absence does not degrade the service status
  try {
    health.checks.redis = await checkRedis();
  } catch (error) {
    health.checks.redis = { status: 'unavailable', error: (error as Error).message };
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    success: health.status !== 'failed',
    data: health,
    meta: {
      request_id: (req as any).requestId,
      version: '1.0.0',
      processing_ms: Date.now() - (req as any).startTime,
    },
  });
};

const checkDatabase = async (): Promise<{ status: string; response_time_ms: number }> => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start,
    };
  } catch (error) {
    throw new Error('Database connection failed');
  }
};

const checkRedis = async (): Promise<{ status: string; response_time_ms: number }> => {
  const start = Date.now();
  try {
    await redis.ping();
    return {
      status: 'healthy',
      response_time_ms: Date.now() - start,
    };
  } catch (error) {
    throw new Error('Redis connection failed');
  }
};