import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import { hashApiKey } from '../utils/hashUtils';

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  FREE: { limit: 30, windowMs: 30 * 24 * 60 * 60 * 1000 }, 
  BASIC: { limit: 500, windowMs: 30 * 24 * 60 * 60 * 1000 },
  PRO: { limit: 3000, windowMs: 30 * 24 * 60 * 60 * 1000 },
  ENTERPRISE: { limit: 30000, windowMs: 30 * 24 * 60 * 60 * 1000 },
};

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-rapidapi-key'] as string;
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'API key is required',
        code: 'API_KEY_MISSING',
      },
    });
  }

  const apiKeyHash = hashApiKey(apiKey);
  const userTier = (req as any).userTier || determineUserTier(apiKey);
  const limits = RATE_LIMITS[userTier];

  const now = Date.now();
  const windowStart = now - limits.windowMs;
  const key = `ratelimit:${apiKeyHash}`;

  try {
    const timestamps = await redis.lrange(key, 0, -1);
    
    const validTimestamps = timestamps.filter(ts => parseInt(ts) > windowStart);
    
    if (validTimestamps.length >= limits.limit) {
      const resetTime = parseInt(validTimestamps[validTimestamps.length - limits.limit]) + limits.windowMs;
      
      return res.status(429).json({
        success: false,
        error: {
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            reset: new Date(resetTime).toISOString(),
          },
        },
      });
    }

    await redis.rpush(key, now.toString());
    await redis.expire(key, Math.ceil(limits.windowMs / 1000));

    res.set('X-RateLimit-Limit', limits.limit.toString());
    res.set('X-RateLimit-Remaining', (limits.limit - validTimestamps.length - 1).toString());
    res.set('X-RateLimit-Reset', new Date(now + limits.windowMs).toISOString());
    res.set('X-RateLimit-Tier', userTier);

    return next();
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return next(); 
  }
};

const determineUserTier = (apiKey: string): string => {
  if (apiKey.startsWith('pro_')) return 'PRO';
  if (apiKey.startsWith('enterprise_')) return 'ENTERPRISE';
  if (apiKey.startsWith('test_')) return 'FREE';
  return 'BASIC';
};