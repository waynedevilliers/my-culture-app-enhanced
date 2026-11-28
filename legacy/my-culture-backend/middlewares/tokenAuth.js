import { verifyCertificateToken } from '../utils/tokenService.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncWrapper from '../utils/asyncWrapper.js';
import logger from '../utils/logger.js';

/**
 * Middleware to verify certificate access tokens
 * @param {string} expectedPurpose - Expected token purpose
 * @returns {Function} - Express middleware
 */
export const verifyCertificateAccess = (expectedPurpose = 'certificate_access') => {
  return asyncWrapper(async (req, res, next) => {
    try {
      // Get token from query parameter, header, or body
      const token = req.query.token || 
                    req.headers.authorization?.replace('Bearer ', '') || 
                    req.body.token;

      if (!token) {
        throw new ErrorResponse('Access token required', 401);
      }

      // Verify token
      const decoded = verifyCertificateToken(token, expectedPurpose);

      // Add decoded token to request
      req.certificateToken = decoded;
      req.tokenId = decoded.jti;

      // Validate access to specific certificate
      const certificateId = parseInt(req.params.certificateId || req.params.id);
      if (decoded.certificateId !== certificateId) {
        throw new ErrorResponse('Token not valid for this certificate', 403);
      }

      // Validate recipient access if recipientId is provided
      if (req.params.recipientId) {
        const recipientId = parseInt(req.params.recipientId);
        if (decoded.recipientId && decoded.recipientId !== recipientId) {
          throw new ErrorResponse('Token not valid for this recipient', 403);
        }
      }

      // Log successful access
      logger.info(`Certificate access granted`, {
        certificateId: decoded.certificateId,
        recipientId: decoded.recipientId,
        purpose: decoded.purpose,
        tokenId: decoded.jti,
        clientIp: req.ip
      });

      next();
    } catch (error) {
      logger.warn(`Certificate access denied: ${error.message}`, {
        certificateId: req.params.certificateId || req.params.id,
        clientIp: req.ip,
        userAgent: req.get('User-Agent')
      });

      if (error instanceof ErrorResponse) {
        return res.status(error.statusCode).json({
          message: error.message,
          error: 'CERTIFICATE_ACCESS_DENIED'
        });
      }

      // JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Certificate access token has expired',
          error: 'TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid certificate access token',
          error: 'INVALID_TOKEN'
        });
      }

      // Generic error
      return res.status(401).json({
        message: 'Certificate access denied',
        error: 'ACCESS_DENIED'
      });
    }
  });
};

/**
 * Middleware to verify download tokens
 */
export const verifyDownloadAccess = verifyCertificateAccess('download_access');

/**
 * Middleware to verify share tokens
 */
export const verifyShareAccess = verifyCertificateAccess('share_access');

/**
 * Middleware to increment token usage count
 * This should be called after successful token verification
 */
export const incrementTokenUsage = asyncWrapper(async (req, res, next) => {
  try {
    const token = req.certificateToken;
    
    if (token && token.maxUses > 0) {
      // In a production environment, you would update the token usage in a database
      // For now, we'll log the usage
      logger.info(`Token usage incremented`, {
        tokenId: token.jti,
        certificateId: token.certificateId,
        usedCount: token.usedCount + 1,
        maxUses: token.maxUses
      });

      // Add usage info to response headers
      res.set('X-Token-Usage', `${token.usedCount + 1}/${token.maxUses}`);
    }

    next();
  } catch (error) {
    logger.error(`Error incrementing token usage: ${error.message}`);
    // Don't fail the request for usage tracking errors
    next();
  }
});

/**
 * Middleware to validate token rate limits
 */
export const validateTokenRateLimit = asyncWrapper(async (req, res, next) => {
  try {
    const token = req.certificateToken;
    const clientIp = req.ip;

    if (token && token.jti) {
      // Simple rate limiting check (in production, use Redis)
      const rateLimitKey = `${token.jti}:${clientIp}`;
      
      // TODO: Implement proper rate limiting
      // For now, we'll just log the request
      logger.debug(`Token rate limit check`, {
        tokenId: token.jti,
        clientIp,
        certificateId: token.certificateId
      });
    }

    next();
  } catch (error) {
    logger.error(`Error validating token rate limit: ${error.message}`);
    // Don't fail the request for rate limiting errors
    next();
  }
});

/**
 * Middleware to add security headers for certificate access
 */
export const addSecurityHeaders = (req, res, next) => {
  // Prevent caching of sensitive certificate content
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  // Add security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add custom headers
  res.set('X-Certificate-Access', 'true');
  res.set('X-Powered-By', 'My Culture App');

  next();
};

/**
 * Combined middleware for secure certificate access
 */
export const secureCertificateAccess = [
  addSecurityHeaders,
  verifyCertificateAccess(),
  validateTokenRateLimit,
  incrementTokenUsage
];

/**
 * Combined middleware for secure download access
 */
export const secureDownloadAccess = [
  addSecurityHeaders,
  verifyDownloadAccess,
  validateTokenRateLimit,
  incrementTokenUsage
];

export default {
  verifyCertificateAccess,
  verifyDownloadAccess,
  verifyShareAccess,
  incrementTokenUsage,
  validateTokenRateLimit,
  addSecurityHeaders,
  secureCertificateAccess,
  secureDownloadAccess
};