import multer from 'multer';
import localFileUploader from './localFileUploader.js';
import fileUploader from './fileUploader.js';
import localFileUrl from './localFileUrl.js';
import vercelBlobUploader from './vercelBlobUploader.js';

/**
 * Unified storage handler that automatically switches between:
 * - Local filesystem storage (development)
 * - Vercel Blob storage (production)
 */

// Determine storage type based on environment
const isProduction = process.env.NODE_ENV === 'production';

/**
 * File uploader middleware (first step)
 * - Development: Uses disk storage (saves to filesystem)
 * - Production: Uses memory storage (keeps in buffer for Vercel Blob)
 */
export const fileStorageUploader = isProduction
  ? fileUploader  // Memory storage for production
  : localFileUploader;  // Disk storage for development

/**
 * File URL generator middleware (second step)
 * - Development: Constructs localhost URL
 * - Production: Uploads to Vercel Blob and returns Vercel URL
 */
export const fileUrlGenerator = isProduction
  ? vercelBlobUploader  // Upload to Vercel Blob
  : localFileUrl;  // Generate localhost URL

/**
 * Get the file URL from the request object
 * Abstracts away the difference between local and Vercel storage
 */
export const getFileUrl = (req) => {
  return isProduction ? req.vercelBlobURL : req.localFileURL;
};

export default {
  fileStorageUploader,
  fileUrlGenerator,
  getFileUrl,
  isProduction
};
