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

// Conditional route import to avoid database dependency issues

const app = express();
const PORT = process.env.PORT || 3000;

app.use(generalLimiter);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port, no origin (for Postman/curl), or Vercel domains
    if (!origin || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('https://localhost:') ||
        origin.includes('vercel.app') ||
        origin.includes('my-culture-frontend')) {
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

// Simple endpoints that don't require database
app.get('/', (req, res) => {
  res.status(418).send("I am a teapot");
})

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorHandler);

const __dirname = path.resolve(); 
app.use("/certificates", express.static(path.join(__dirname, "public", "certificates")));
app.use("/images", express.static(path.join(__dirname, "../my-culture-frontend/public/images")));

app.listen(PORT, async () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    url: process.env.URL,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });

  // Initialize database connection for production
  if (process.env.NODE_ENV === 'production') {
    try {
      const { initializeDatabase } = await import('./db.js');
      await initializeDatabase();
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Database initialization failed:', error);
    }
  }

  // Load API routes (works in both dev and production)
  try {
    const routesModule = await import('./routes/index.js');
    app.use('/api', routesModule.default);
    logger.info('API routes loaded and mounted successfully');
  } catch (error) {
    logger.error('API routes failed to load:', error.message);
    logger.error('Stack trace:', error.stack);
    app.use('/api', (req, res) => {
      res.status(503).json({ message: 'API temporarily unavailable', error: error.message });
    });
  }

  // Start the cleanup scheduler
  try {
    const { startCleanupScheduler } = await import('./utils/cleanupService.js');
    startCleanupScheduler();
  } catch (error) {
    logger.warn('Cleanup scheduler not available:', error.message);
  }
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

// Export the app for serverless environments
export default app;