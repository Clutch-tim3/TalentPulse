import { Request, Response } from 'express';
import titleNormaliserService from '../services/titleNormaliser.service';

export const normaliseJobTitles = async (req: Request, res: Response) => {
  try {
    const titlesParam = req.query.titles as string;
    if (!titlesParam) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Titles parameter is required',
          code: 'TITLES_REQUIRED',
        },
        meta: {
          request_id: (req as any).requestId,
          version: '1.0.0',
          processing_ms: Date.now() - (req as any).startTime,
        },
      });
    }

    const titles = titlesParam.split(',').map((title: string) => title.trim());
    const results = await titleNormaliserService.normalizeJobTitles(titles);
    
    return res.json({
      success: true,
      data: { results },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
        from_cache: false,
      },
    });
  } catch (error) {
    console.error('Title normalization error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Failed to normalize job titles',
        code: 'TITLE_NORMALIZATION_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};