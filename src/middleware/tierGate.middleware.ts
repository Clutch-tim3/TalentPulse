import { Request, Response, NextFunction } from 'express';

const TIER_PERMISSIONS: Record<string, string[]> = {
  FREE: ['/salary/benchmark', '/health'],
  BASIC: [
    '/salary/benchmark', '/salary/compare', '/salary/evaluate',
    '/skills/demand', '/skills/trending', '/skills/gap-analysis',
    '/roles/intelligence', '/company/hiring', '/company/compare',
    '/market/overview', '/jobs/search', '/titles/normalise',
    '/health'
  ],
  PRO: [
    '/salary/benchmark', '/salary/compare', '/salary/evaluate',
    '/skills/demand', '/skills/trending', '/skills/gap-analysis',
    '/roles/intelligence', '/company/hiring', '/company/compare',
    '/market/overview', '/jobs/search', '/titles/normalise',
    '/health'
  ],
  ENTERPRISE: [
    '/salary/benchmark', '/salary/compare', '/salary/evaluate',
    '/skills/demand', '/skills/trending', '/skills/gap-analysis',
    '/roles/intelligence', '/company/hiring', '/company/compare',
    '/market/overview', '/jobs/search', '/titles/normalise',
    '/health'
  ],
};

export const tierGate = (req: Request, res: Response, next: NextFunction) => {
  const userTier = (req as any).userTier || 'FREE';
  const path = req.route?.path || req.originalUrl;
  
  const allowedEndpoints = TIER_PERMISSIONS[userTier];
  
  if (!allowedEndpoints) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid user tier',
        code: 'INVALID_TIER',
      },
    });
  }

  const isAllowed = allowedEndpoints.some(endpoint => 
    path.includes(endpoint)
  );

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'This endpoint is not available on your current plan. Please upgrade to access this feature.',
        code: 'ENDPOINT_NOT_ALLOWED',
        details: {
          required_tier: determineRequiredTier(path),
          current_tier: userTier,
        },
      },
    });
  }

  return next();
};

const determineRequiredTier = (path: string): string => {
  if (path.includes('/salary/evaluate') || path.includes('/skills/gap-analysis')) {
    return 'BASIC';
  }
  if (path.includes('/company/compare') || path.includes('/salary/compare')) {
    return 'BASIC';
  }
  if (path.includes('/market/overview') || path.includes('/jobs/search')) {
    return 'BASIC';
  }
  
  return 'FREE';
};