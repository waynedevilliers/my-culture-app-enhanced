import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from './logger.js';

// Token configuration
const TOKEN_CONFIG = {
  // Certificate access token settings
  CERTIFICATE_TOKEN_EXPIRY: process.env.CERTIFICATE_TOKEN_EXPIRY || '7d', // 7 days
  CERTIFICATE_TOKEN_SECRET: process.env.CERTIFICATE_TOKEN_SECRET || process.env.SECRET || 'fallback-secret',
  
  // Download token settings (short-lived)
  DOWNLOAD_TOKEN_EXPIRY: process.env.DOWNLOAD_TOKEN_EXPIRY || '1h', // 1 hour
  
  // Share token settings (longer-lived)
  SHARE_TOKEN_EXPIRY: process.env.SHARE_TOKEN_EXPIRY || '30d', // 30 days
  
  // Token refresh settings
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '90d', // 90 days
  
  // Security settings
  ENABLE_TOKEN_ROTATION: process.env.ENABLE_TOKEN_ROTATION !== 'false',
  MAX_TOKEN_USES: parseInt(process.env.MAX_TOKEN_USES) || 0, // 0 = unlimited
  
  // Rate limiting
  TOKEN_RATE_LIMIT: parseInt(process.env.TOKEN_RATE_LIMIT) || 100, // requests per hour
};

/**
 * Generate a secure access token for certificate viewing
 * @param {Object} payload - Token payload
 * @param {Object} options - Token options
 * @returns {string} - JWT token
 */
export const generateCertificateToken = (payload, options = {}) => {
  const {
    expiresIn = TOKEN_CONFIG.CERTIFICATE_TOKEN_EXPIRY,
    maxUses = TOKEN_CONFIG.MAX_TOKEN_USES,
    purpose = 'certificate_access'
  } = options;

  const tokenPayload = {
    ...payload,
    purpose,
    maxUses,
    usedCount: 0,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(), // Unique token ID
  };

  const token = jwt.sign(tokenPayload, TOKEN_CONFIG.CERTIFICATE_TOKEN_SECRET, {
    expiresIn,
    issuer: 'my-culture-app',
    audience: 'certificate-viewer'
  });

  logger.info(`Generated certificate token for ${payload.certificateId}`, {
    certificateId: payload.certificateId,
    recipientId: payload.recipientId,
    purpose,
    expiresIn,
    tokenId: tokenPayload.jti
  });

  return token;
};

/**
 * Generate a download token for PDF/PNG downloads
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
export const generateDownloadToken = (payload) => {
  return generateCertificateToken(payload, {
    expiresIn: TOKEN_CONFIG.DOWNLOAD_TOKEN_EXPIRY,
    purpose: 'download_access'
  });
};

/**
 * Generate a share token for social sharing
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
export const generateShareToken = (payload) => {
  return generateCertificateToken(payload, {
    expiresIn: TOKEN_CONFIG.SHARE_TOKEN_EXPIRY,
    purpose: 'share_access'
  });
};

/**
 * Generate a refresh token for token renewal
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
export const generateRefreshToken = (payload) => {
  return generateCertificateToken(payload, {
    expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY,
    purpose: 'refresh_token'
  });
};

/**
 * Verify and decode a certificate token
 * @param {string} token - JWT token
 * @param {string} expectedPurpose - Expected token purpose
 * @returns {Object} - Decoded token payload
 */
export const verifyCertificateToken = (token, expectedPurpose = 'certificate_access') => {
  try {
    const decoded = jwt.verify(token, TOKEN_CONFIG.CERTIFICATE_TOKEN_SECRET, {
      issuer: 'my-culture-app',
      audience: 'certificate-viewer'
    });

    // Check token purpose
    if (decoded.purpose !== expectedPurpose) {
      throw new Error(`Invalid token purpose. Expected: ${expectedPurpose}, Got: ${decoded.purpose}`);
    }

    // Check usage limits
    if (decoded.maxUses > 0 && decoded.usedCount >= decoded.maxUses) {
      throw new Error('Token usage limit exceeded');
    }

    logger.debug(`Token verified successfully`, {
      tokenId: decoded.jti,
      purpose: decoded.purpose,
      certificateId: decoded.certificateId,
      usedCount: decoded.usedCount
    });

    return decoded;
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`, {
      error: error.message,
      expectedPurpose
    });
    throw error;
  }
};

/**
 * Create a secure certificate URL with access token
 * @param {number} certificateId - Certificate ID
 * @param {number} recipientId - Recipient ID
 * @param {Object} options - URL options
 * @returns {string} - Secure URL
 */
export const createSecureCertificateUrl = (certificateId, recipientId, options = {}) => {
  const {
    baseUrl = process.env.URL || 'http://localhost:3000',
    purpose = 'certificate_access',
    expiresIn = TOKEN_CONFIG.CERTIFICATE_TOKEN_EXPIRY
  } = options;

  const payload = {
    certificateId,
    recipientId,
    timestamp: Date.now()
  };

  const token = generateCertificateToken(payload, { 
    purpose, 
    expiresIn 
  });

  const secureUrl = `${baseUrl}/certificates/secure/${certificateId}/${recipientId}?token=${token}`;
  
  logger.info(`Created secure certificate URL`, {
    certificateId,
    recipientId,
    purpose,
    expiresIn
  });

  return secureUrl;
};

/**
 * Create a secure download URL for PDF/PNG files
 * @param {number} certificateId - Certificate ID
 * @param {string} fileType - File type (pdf/png)
 * @param {Object} options - URL options
 * @returns {string} - Secure download URL
 */
export const createSecureDownloadUrl = (certificateId, fileType, options = {}) => {
  const {
    baseUrl = process.env.URL || 'http://localhost:3000',
    recipientId
  } = options;

  const payload = {
    certificateId,
    fileType,
    recipientId,
    timestamp: Date.now()
  };

  const token = generateDownloadToken(payload);
  const secureUrl = `${baseUrl}/api/certificates/secure/${certificateId}/${fileType}?token=${token}`;
  
  logger.info(`Created secure download URL`, {
    certificateId,
    fileType,
    recipientId
  });

  return secureUrl;
};

/**
 * Refresh an expired token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} - New tokens
 */
export const refreshCertificateToken = async (refreshToken) => {
  try {
    const decoded = verifyCertificateToken(refreshToken, 'refresh_token');
    
    // Generate new access token
    const newAccessToken = generateCertificateToken({
      certificateId: decoded.certificateId,
      recipientId: decoded.recipientId,
      timestamp: Date.now()
    });

    // Generate new refresh token if rotation is enabled
    const newRefreshToken = TOKEN_CONFIG.ENABLE_TOKEN_ROTATION 
      ? generateRefreshToken({
          certificateId: decoded.certificateId,
          recipientId: decoded.recipientId,
          timestamp: Date.now()
        })
      : refreshToken;

    logger.info(`Token refreshed successfully`, {
      certificateId: decoded.certificateId,
      recipientId: decoded.recipientId,
      rotated: TOKEN_CONFIG.ENABLE_TOKEN_ROTATION
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: TOKEN_CONFIG.CERTIFICATE_TOKEN_EXPIRY
    };
  } catch (error) {
    logger.error(`Token refresh failed: ${error.message}`);
    throw error;
  }
};

/**
 * Validate token rate limiting
 * @param {string} tokenId - Token ID
 * @param {string} clientIp - Client IP address
 * @returns {boolean} - Whether request is within rate limit
 */
export const validateTokenRateLimit = async (tokenId, clientIp) => {
  // This is a simple implementation - in production, use Redis or similar
  // For now, we'll implement basic rate limiting in memory
  const rateLimitKey = `${tokenId}:${clientIp}`;
  
  // TODO: Implement proper rate limiting with Redis
  // For now, return true (no rate limiting)
  return true;
};

/**
 * Get token configuration
 * @returns {Object} - Token configuration
 */
export const getTokenConfig = () => {
  return {
    ...TOKEN_CONFIG,
    // Hide sensitive information
    CERTIFICATE_TOKEN_SECRET: '[HIDDEN]'
  };
};

/**
 * Validate token configuration
 * @returns {Object} - Validation results
 */
export const validateTokenConfig = () => {
  const errors = [];
  const warnings = [];

  // Check secret strength
  if (TOKEN_CONFIG.CERTIFICATE_TOKEN_SECRET.length < 32) {
    warnings.push('Certificate token secret should be at least 32 characters for security');
  }

  // Check expiry times
  if (TOKEN_CONFIG.CERTIFICATE_TOKEN_EXPIRY === '7d' && TOKEN_CONFIG.CERTIFICATE_TOKEN_SECRET === 'fallback-secret') {
    errors.push('Using fallback secret with long expiry is insecure');
  }

  // Check download token expiry
  try {
    const parsed = parseInt(TOKEN_CONFIG.DOWNLOAD_TOKEN_EXPIRY);
    if (isNaN(parsed) && !TOKEN_CONFIG.DOWNLOAD_TOKEN_EXPIRY.includes('h')) {
      warnings.push('Download token expiry should be short (hours, not days)');
    }
  } catch (error) {
    errors.push('Invalid download token expiry format');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config: getTokenConfig()
  };
};

export default {
  generateCertificateToken,
  generateDownloadToken,
  generateShareToken,
  generateRefreshToken,
  verifyCertificateToken,
  createSecureCertificateUrl,
  createSecureDownloadUrl,
  refreshCertificateToken,
  validateTokenRateLimit,
  getTokenConfig,
  validateTokenConfig
};