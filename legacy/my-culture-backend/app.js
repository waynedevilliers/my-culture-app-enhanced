import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { specs, swaggerUi } from './swagger.js';
import logger from './utils/logger.js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();

app.use(generalLimiter);
app.use(cors({
  origin: (origin, callback) => {
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

if (process.env.NODE_ENV === 'production') {
  app.use(requestLogger);
} else {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.status(418).send("I am a teapot");
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const __dirname = path.resolve();
app.use("/certificates", express.static(path.join(__dirname, "public", "certificates")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/images", express.static(path.join(__dirname, "../my-culture-frontend/public/images")));

// Asynchronous part of app setup
async function setupApp() {
  try {
    const { initializeDatabase } = await import('./db.js');
    await initializeDatabase();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    // In a serverless environment, we might want to fail gracefully
    // For now, we'll log and continue, routes that need DB will fail
  }

  try {
    const routesModule = await import('./routes/index.js');
    app.use('/api', routesModule.default);
    logger.info('API routes loaded and mounted successfully');
  } catch (error) {
    logger.error('API routes failed to load:', error);
    app.use('/api', (req, res) => {
      res.status(503).json({ message: 'API temporarily unavailable', error: error.message });
    });
  }
  
  // This should be last
  app.use(errorHandler);

  return app;
}

export default setupApp;
