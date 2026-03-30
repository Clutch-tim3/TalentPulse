import { Router } from 'express';
import { getSalaryBenchmark, getSalaryComparison, evaluateSalaryOffer } from '../controllers/salary.controller';
import { validate } from '../middleware/validation.middleware';
import { SalaryBenchmarkQuerySchema, SalaryCompareQuerySchema } from '../types/salary.types';

const router = Router();

router.get('/benchmark', validate(SalaryBenchmarkQuerySchema), getSalaryBenchmark);
router.get('/compare', validate(SalaryCompareQuerySchema), getSalaryComparison);
router.post('/evaluate', evaluateSalaryOffer);

export default router;