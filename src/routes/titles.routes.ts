import { Router } from 'express';
import { normaliseJobTitles } from '../controllers/titles.controller';

const router = Router();

router.get('/normalise', normaliseJobTitles);

export default router;