import { Request, Response } from 'express';
import companyService from '../services/company.service';
import { CompanyHiringQuerySchema, CompanyCompareQuerySchema } from '../types/company.types';

export const getCompanyHiringProfile = async (req: Request, res: Response) => {
  try {
    const query = CompanyHiringQuerySchema.parse(req.query);
    const data = await companyService.getCompanyHiringProfile(query);
    
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
    console.error('Company hiring profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get company hiring profile',
        code: 'COMPANY_HIRING_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};

export const compareCompanies = async (req: Request, res: Response) => {
  try {
    const query = CompanyCompareQuerySchema.parse(req.query);
    const data = await companyService.compareCompanies(query);
    
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
    console.error('Company comparison error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to compare companies',
        code: 'COMPANY_COMPARE_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};