import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  }

  // Log error details
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    statusCode: customError.statusCode,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    customError.statusCode = 400;
    customError.message = err.errors.map(error => error.message).join(', ');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    customError.statusCode = 409;
    customError.message = 'Resource already exists';
  }

  if (err.name === 'JsonWebTokenError') {
    customError.statusCode = 401;
    customError.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    customError.statusCode = 401;
    customError.message = 'Token expired';
  }

  res.status(customError.statusCode).json({ 
    error: { 
      message: customError.message, 
      status: customError.statusCode 
    } 
  });
};