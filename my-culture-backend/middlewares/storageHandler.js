import fileUploader from './fileUploader.js';
import { createLocalFileUploader } from './localFileUploader.js';
import { createLocalFileUrl } from './localFileUrl.js';
import { createVercelBlobUploader } from './vercelBlobUploader.js';

/**
 * Unified storage handler that switches between:
 * - Local filesystem storage (development, test)
 * - Vercel Blob storage (production)
 *
 * NODE_ENV is fixed for the lifetime of the process, so it is read once.
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create the two upload middlewares for a folder.
 * - uploader: multer instance; call .single(fieldName)
 * - urlGenerator: sets the file URL on req (read it with getFileUrl)
 *
 * @param {string} folder single path segment, for example "images"
 * @returns {{ uploader: import('multer').Multer, urlGenerator: Function }}
 */
export const createStorage = (folder) => (isProduction
  ? { uploader: fileUploader, urlGenerator: createVercelBlobUploader(folder) }
  : { uploader: createLocalFileUploader(folder), urlGenerator: createLocalFileUrl(folder) });

const organizationStorage = createStorage('organizations');

/** Uploader for organization logos (kept for existing routes). */
export const fileStorageUploader = organizationStorage.uploader;

/** URL generator for organization logos (kept for existing routes). */
export const fileUrlGenerator = organizationStorage.urlGenerator;

/**
 * Get the uploaded file's URL, whichever storage handled it.
 *
 * @param {object} [req]
 * @returns {string|null}
 */
export const getFileUrl = (req) => {
  if (!req) {
    return null;
  }
  return (isProduction ? req.vercelBlobURL : req.localFileURL) || null;
};

export default {
  createStorage,
  fileStorageUploader,
  fileUrlGenerator,
  getFileUrl,
  isProduction,
};
