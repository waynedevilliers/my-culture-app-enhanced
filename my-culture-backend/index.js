import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Load environment variables
dotenv.config();
import bodyParser from 'body-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { specs, swaggerUi } from './swagger.js';
import logger from './utils/logger.js';
import path from 'path';

import router from './routes/index.js';
import { startCleanupScheduler } from './utils/cleanupService.js';
import "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(generalLimiter);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port or no origin (for Postman/curl)
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(requestLogger);
} else {
  app.use(morgan('dev'));
}

app.use('/api', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorHandler);

app.get('/', (req, res) => {
  res.status(418).send("I am a teapot");
})

const __dirname = path.resolve(); 
app.use("/certificates", express.static(path.join(__dirname, "public", "certificates")));
app.use("/images", express.static(path.join(__dirname, "../my-culture-frontend/public/images")));

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    url: process.env.URL,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });

  // Start the cleanup scheduler
  startCleanupScheduler();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  try {
    const { closeQueues } = await import('./utils/queueService.js');
    await closeQueues();
  } catch (error) {
    logger.warn('Queue service not available during shutdown');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  try {
    const { closeQueues } = await import('./utils/queueService.js');
    await closeQueues();
  } catch (error) {
    logger.warn('Queue service not available during shutdown');
  }
  process.exit(0);
});