import { Request, Response } from 'express';
import marketService from '../services/market.service';

export const getMarketOverview = async (req: Request, res: Response) => {
  try {
    const query = {
      sector: (req.query.sector as string) || 'all',
      location: (req.query.location as string) || 'global',
      include_forecast: req.query.include_forecast === 'true',
    };
    
    const data = await marketService.getMarketOverview(query);
    
    res.json({
      success: true,
      data,
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
        from_cache: false,
      },
    });
  } catch (error) {
    console.error('Market overview error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get market overview',
        code: 'MARKET_OVERVIEW_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};