import { Request, Response } from 'express';
import skillsService from '../services/skills.service';
import gapAnalysisService from '../services/gapAnalysis.service';
import { SkillDemandQuerySchema, TrendingSkillsQuerySchema, SkillGapAnalysisRequestSchema } from '../types/skills.types';

export const getSkillDemand = async (req: Request, res: Response) => {
  try {
    const query = SkillDemandQuerySchema.parse(req.query);
    const data = await skillsService.getSkillDemand(query);
    
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
    console.error('Skill demand error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get skill demand data',
        code: 'SKILL_DEMAND_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};

export const getTrendingSkills = async (req: Request, res: Response) => {
  try {
    const query = TrendingSkillsQuerySchema.parse(req.query);
    const data = await skillsService.getTrendingSkills(query);
    
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
    console.error('Trending skills error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get trending skills',
        code: 'TRENDING_SKILLS_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};

export const analyzeSkillGap = async (req: Request, res: Response) => {
  try {
    const body = SkillGapAnalysisRequestSchema.parse(req.body);
    const data = await gapAnalysisService.analyzeSkillGap(body);
    
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
    console.error('Skill gap analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to analyze skill gap',
        code: 'SKILL_GAP_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};