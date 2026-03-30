import { Request, Response } from 'express';
import salaryService from '../services/salary.service';
import { SalaryBenchmarkQuerySchema, SalaryCompareQuerySchema, SalaryEvaluationRequest } from '../types/salary.types';

export const getSalaryBenchmark = async (req: Request, res: Response) => {
  try {
    const query = SalaryBenchmarkQuerySchema.parse(req.query);
    const data = await salaryService.getSalaryBenchmark(query);
    
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
    console.error('Salary benchmark error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get salary benchmark',
        code: 'SALARY_BENCHMARK_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};

export const getSalaryComparison = async (req: Request, res: Response) => {
  try {
    const query = SalaryCompareQuerySchema.parse(req.query);
    const data = await salaryService.getSalaryComparison(query);
    
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
    console.error('Salary comparison error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get salary comparison',
        code: 'SALARY_COMPARISON_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};

export const evaluateSalaryOffer = async (req: Request, res: Response) => {
  try {
    const data = req.body as SalaryEvaluationRequest;
    const result = await salaryService.evaluateSalaryOffer(data);
    
    res.json({
      success: true,
      data: result,
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
        from_cache: false,
      },
    });
  } catch (error) {
    console.error('Salary evaluation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to evaluate salary offer',
        code: 'SALARY_EVALUATION_FAILED',
      },
      meta: {
        request_id: (req as any).requestId,
        version: '1.0.0',
        processing_ms: Date.now() - (req as any).startTime,
      },
    });
  }
};