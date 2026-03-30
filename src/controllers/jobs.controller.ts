import { Request, Response } from 'express';
import jobsService from '../services/jobs.service';

export const searchJobs = async (req: Request, res: Response) => {
  try {
    const query = {
      title: req.query.title as string,
      location: req.query.location as string,
      skills: req.query.skills as string,
      experience_level: req.query.experience_level as string,
      remote: req.query.remote === 'true',
      salary_min: req.query.salary_min ? parseInt(req.query.salary_min as string) : undefined,
      company_size: req.query.company_size as string,
      posted_within: req.query.posted_within as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };
    
    const data = await jobsService.searchJobs(query);
    
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
    console.error('Job search error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to search jobs',
        code: 'JOB_SEARCH_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};