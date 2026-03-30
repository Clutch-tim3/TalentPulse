import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';
import morgan from 'morgan';
import 'express-async-errors';

import { authenticateApiKey, trackApiUsage } from './middleware/auth.middleware';
import { rateLimit } from './middleware/rateLimit.middleware';
import { tierGate } from './middleware/tierGate.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';

import salaryRoutes from './routes/salary.routes';
import skillsRoutes from './routes/skills.routes';
import rolesRoutes from './routes/roles.routes';
import companyRoutes from './routes/company.routes';
import marketRoutes from './routes/market.routes';
import jobsRoutes from './routes/jobs.routes';
import titlesRoutes from './routes/titles.routes';
import healthRoutes from './routes/health.routes';

const app = express();

app.use(morgan('combined'));

app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://rapidapi.com'] : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-RapidAPI-Key', 'X-RapidAPI-Host'],
}));

app.use(xss());
app.use(hpp());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, _res, next) => {
  (req as any).startTime = Date.now();
  next();
});

app.use(requestIdMiddleware);

// Health check must be before auth — Railway/RapidAPI probes without API keys
app.use('/v1/health', healthRoutes);

app.use(authenticateApiKey);
app.use(rateLimit);
app.use(tierGate);
app.use(trackApiUsage);

app.use('/v1/salary', salaryRoutes);
app.use('/v1/skills', skillsRoutes);
app.use('/v1/roles', rolesRoutes);
app.use('/v1/company', companyRoutes);
app.use('/v1/market', marketRoutes);
app.use('/v1/jobs', jobsRoutes);
app.use('/v1/titles', titlesRoutes);

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    meta: {
      request_id: (req as any).requestId,
      version: '1.0.0',
      processing_ms: Date.now() - (req as any).startTime,
    },
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      code: 'ENDPOINT_NOT_FOUND',
    },
    meta: {
      request_id: (req as any).requestId,
      version: '1.0.0',
      processing_ms: Date.now() - (req as any).startTime,
    },
  });
});

export default app;