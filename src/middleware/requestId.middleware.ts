import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get request ID from headers if present, or generate new one
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Set request ID header
  res.setHeader('X-Request-ID', requestId);
  
  // Add to request object for use in logging
  (req as any).requestId = requestId;
  
  next();
};
