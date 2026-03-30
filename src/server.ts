import dotenv from 'dotenv';
import app from './app';
import prisma from './config/database';
import { updateExchangeRates } from './utils/currencyConverter';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connection established');

    await updateExchangeRates();

    app.listen(PORT, () => {
      console.log(`🚀 TalentPulse API server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API documentation: http://localhost:${PORT}/v1/health`);
    });

    process.on('SIGTERM', async () => {
      console.log('Termination signal received. Closing server...');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('Interrupt signal received. Closing server...');
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();