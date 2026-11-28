import crypto from 'crypto';
import { z } from 'zod';

/**
 * Generate secure, unguessable file paths for certificates
 * Format: {orgSlug}-org{orgId}/certificate-{recipientSlug}-cert{certId}-{secureToken}.{ext}
 * Example: bujinkandojo-org123/certificate-wayne-blackbelt-cert456-abc123def.pdf
 */

// Zod schemas for input validation
const securePathSchema = z.object({
  organizationId: z.number().int().positive(),
  organizationName: z.string().min(1).max(255),
  certificateId: z.number().int().positive(),
  certificateTitle: z.string().min(1).max(255),
  recipientName: z.string().min(1).max(255),
  recipientId: z.number().int().positive(),
  fileExtension: z.enum(['pdf', 'png', 'html'])
});

const tokenSchema = z.object({
  length: z.number().int().min(8).max(32).optional().default(16)
});

/**
 * Create URL-safe slug from string
 * @param {string} text - Text to slugify
 * @returns {string} - URL-safe slug
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

/**
 * Generate cryptographically secure random token
 * @param {number} length - Token length in bytes (default: 16)
 * @returns {string} - Hexadecimal token
 */
export function generateSecureToken(length = 16) {
  const validated = tokenSchema.parse({ length });
  return crypto.randomBytes(validated.length).toString('hex');
}

/**
 * Generate secure file path for certificate storage
 * @param {Object} params - Path generation parameters
 * @param {number} params.organizationId - Organization ID
 * @param {string} params.organizationName - Organization name
 * @param {number} params.certificateId - Certificate ID
 * @param {string} params.certificateTitle - Certificate title
 * @param {string} params.recipientName - Recipient name
 * @param {number} params.recipientId - Recipient ID
 * @param {string} params.fileExtension - File extension (pdf, png, html)
 * @returns {string} - Secure file path
 */
export function generateSecureFilePath(params) {
  // Validate input parameters
  const validated = securePathSchema.parse(params);
  
  // Create organization slug
  const orgSlug = createSlug(validated.organizationName);
  
  // Create recipient/certificate slug
  const recipientSlug = createSlug(validated.recipientName);
  const certSlug = createSlug(validated.certificateTitle);
  
  // Generate secure token
  const secureToken = generateSecureToken(12); // 12 bytes = 24 hex chars
  
  // Build secure path components
  const orgFolder = `${orgSlug}-org${validated.organizationId}`;
  const fileName = `certificate-${recipientSlug}-${certSlug}-cert${validated.certificateId}-${secureToken}.${validated.fileExtension}`;
  
  return `${orgFolder}/${fileName}`;
}

/**
 * Generate secure paths for all certificate formats
 * @param {Object} params - Path generation parameters
 * @returns {Object} - Object containing all secure paths
 */
export function generateSecureCertificatePaths(params) {
  const baseParams = securePathSchema.omit({ fileExtension: true }).parse(params);
  
  return {
    pdfPath: generateSecureFilePath({ ...baseParams, fileExtension: 'pdf' }),
    pngPath: generateSecureFilePath({ ...baseParams, fileExtension: 'png' }),
    htmlPath: generateSecureFilePath({ ...baseParams, fileExtension: 'html' })
  };
}

/**
 * Extract metadata from secure file path
 * @param {string} securePath - Secure file path
 * @returns {Object|null} - Extracted metadata or null if invalid format
 */
export function parseSecureFilePath(securePath) {
  const pathRegex = /^(.+)-org(\d+)\/certificate-(.+)-cert(\d+)-([a-f0-9]+)\.(pdf|png|html)$/;
  const match = securePath.match(pathRegex);
  
  if (!match) {
    return null;
  }
  
  const [, orgSlug, orgId, recipientPart, certId, token, extension] = match;
  
  return {
    organizationId: parseInt(orgId),
    organizationSlug: orgSlug,
    certificateId: parseInt(certId),
    secureToken: token,
    fileExtension: extension,
    recipientPart // Contains recipient-certificate slug combination
  };
}

/**
 * Validate secure token format
 * @param {string} token - Token to validate
 * @returns {boolean} - True if token is valid format
 */
export function isValidSecureToken(token) {
  const tokenRegex = /^[a-f0-9]{24}$/; // 12 bytes = 24 hex chars
  return tokenRegex.test(token);
}

/**
 * Generate secure URL for certificate access
 * @param {string} baseUrl - Base URL for the application
 * @param {string} securePath - Secure file path
 * @param {Object} options - URL generation options
 * @param {number} options.expiresIn - Expiration time in seconds (optional)
 * @returns {string} - Secure access URL
 */
export function generateSecureAccessUrl(baseUrl, securePath, options = {}) {
  const { expiresIn } = options;
  
  // Parse secure path to extract components
  const metadata = parseSecureFilePath(securePath);
  if (!metadata) {
    throw new Error('Invalid secure path format');
  }
  
  // Build URL with secure token
  let url = `${baseUrl}/api/certificates/secure/${metadata.organizationId}/${metadata.certificateId}/${metadata.secureToken}.${metadata.fileExtension}`;
  
  // Add expiration if specified
  if (expiresIn) {
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;
    url += `?expires=${expirationTime}`;
  }
  
  return url;
}

/**
 * Validate secure access URL and check expiration
 * @param {string} url - URL to validate
 * @returns {Object} - Validation result
 */
export function validateSecureAccessUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathRegex = /^\/api\/certificates\/secure\/(\d+)\/(\d+)\/([a-f0-9]+)\.(pdf|png|html)$/;
    const match = urlObj.pathname.match(pathRegex);
    
    if (!match) {
      return { valid: false, error: 'Invalid URL format' };
    }
    
    const [, orgId, certId, token, extension] = match;
    
    // Validate token format
    if (!isValidSecureToken(token)) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // Check expiration if present
    const expires = urlObj.searchParams.get('expires');
    if (expires) {
      const expirationTime = parseInt(expires);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime > expirationTime) {
        return { valid: false, error: 'URL has expired' };
      }
    }
    
    return {
      valid: true,
      organizationId: parseInt(orgId),
      certificateId: parseInt(certId),
      secureToken: token,
      fileExtension: extension
    };
  } catch (error) {
    return { valid: false, error: 'Invalid URL structure' };
  }
}