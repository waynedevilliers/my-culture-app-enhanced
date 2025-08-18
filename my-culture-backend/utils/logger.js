import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance with serverless-friendly configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'my-culture-api' },
  transports: [
    // Always use console transport (works in all environments)
    new winston.transports.Console({
      format: combine(
        process.env.NODE_ENV === 'production' ? 
          timestamp({ format: 'HH:mm:ss' }) : 
          colorize(),
        process.env.NODE_ENV === 'production' ? 
          timestamp({ format: 'HH:mm:ss' }) : 
          timestamp({ format: 'HH:mm:ss' }),
        printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      )
    })
  ]
});

export default logger;