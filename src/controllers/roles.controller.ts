import { Request, Response } from 'express';
import rolesService from '../services/roles.service';

export const getRoleIntelligence = async (req: Request, res: Response) => {
  try {
    const query = {
      job_title: req.query.job_title as string,
      include_career_paths: req.query.include_career_paths !== 'false',
      include_skills: req.query.include_skills !== 'false',
      include_market: req.query.include_market !== 'false',
      location: req.query.location as string,
    };
    
    const data = await rolesService.getRoleIntelligence(query);
    
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
    console.error('Role intelligence error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get role intelligence',
        code: 'ROLE_INTELLIGENCE_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};