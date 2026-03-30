import { Router } from 'express';
import { getRoleIntelligence } from '../controllers/roles.controller';

const router = Router();

router.get('/intelligence', getRoleIntelligence);

export default router;