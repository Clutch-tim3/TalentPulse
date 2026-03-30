import { Request, Response, NextFunction } from 'express';
import { hashApiKey } from '../utils/hashUtils';
import prisma from '../config/database';

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
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
  
  (req as any).apiKeyHash = apiKeyHash;
  
  const userTier = await determineUserTier(apiKey);
  (req as any).userTier = userTier;
  
  return next();
};

const determineUserTier = async (apiKey: string): Promise<string> => {
  if (apiKey.startsWith('test_')) {
    return 'FREE';
  }
  
  return 'BASIC'; 
};

export const trackApiUsage = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.json;
  
  res.json = function(body: any) {
    const apiKeyHash = (req as any).apiKeyHash;
    const userTier = (req as any).userTier || 'FREE';
    const endpoint = req.route?.path || req.originalUrl;
    const status = res.statusCode;
    
    if (apiKeyHash) {
      prisma.apiUsage.create({
        data: {
          api_key_hash: apiKeyHash,
          tier: userTier,
          endpoint: endpoint,
          request_weight: calculateRequestWeight(endpoint),
          response_status: status,
          duration_ms: Date.now() - (req as any).startTime,
          from_cache: (res as any).fromCache || false,
        },
      }).catch(error => {
        console.error('Failed to track API usage:', error);
      });
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

const calculateRequestWeight = (endpoint: string): number => {
  if (endpoint.includes('/salary/compare')) return 5;
  if (endpoint.includes('/salary/evaluate')) return 4;
  if (endpoint.includes('/skills/gap-analysis')) return 6;
  if (endpoint.includes('/roles/intelligence')) return 5;
  if (endpoint.includes('/company/compare')) return 8;
  if (endpoint.includes('/company/hiring')) return 5;
  if (endpoint.includes('/skills/trending')) return 4;
  if (endpoint.includes('/market/overview')) return 4;
  if (endpoint.includes('/jobs/search')) return 3;
  if (endpoint.includes('/salary/benchmark')) return 3;
  if (endpoint.includes('/skills/demand')) return 2;
  if (endpoint.includes('/titles/normalise')) return 1;
  
  return 1;
};