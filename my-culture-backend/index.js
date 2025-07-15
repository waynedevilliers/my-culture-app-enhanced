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
  origin: ['http://localhost:5177', 'http://localhost:5176', 'http://localhost:5173', 'http://localhost:3000'],
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