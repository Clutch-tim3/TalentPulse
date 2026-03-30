import { Router } from 'express';
import { getMarketOverview } from '../controllers/market.controller';

const router = Router();

router.get('/overview', getMarketOverview);

export default router;