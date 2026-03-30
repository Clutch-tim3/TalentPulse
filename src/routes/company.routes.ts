import { Router } from 'express';
import { getCompanyHiringProfile, compareCompanies } from '../controllers/company.controller';
import { validate } from '../middleware/validation.middleware';
import { CompanyHiringQuerySchema, CompanyCompareQuerySchema } from '../types/company.types';

const router = Router();

router.get('/hiring', validate(CompanyHiringQuerySchema), getCompanyHiringProfile);
router.get('/compare', validate(CompanyCompareQuerySchema), compareCompanies);

export default router;