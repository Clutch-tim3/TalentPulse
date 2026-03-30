import { Router } from 'express';
import { getSkillDemand, getTrendingSkills, analyzeSkillGap } from '../controllers/skills.controller';
import { validate } from '../middleware/validation.middleware';
import { SkillDemandQuerySchema, TrendingSkillsQuerySchema, SkillGapAnalysisRequestSchema } from '../types/skills.types';

const router = Router();

router.get('/demand', validate(SkillDemandQuerySchema), getSkillDemand);
router.get('/trending', validate(TrendingSkillsQuerySchema), getTrendingSkills);
router.post('/gap-analysis', validate(SkillGapAnalysisRequestSchema), analyzeSkillGap);

export default router;