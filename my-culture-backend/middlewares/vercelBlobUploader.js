import { put as blobPut } from '@vercel/blob';
import asyncWrapper from '../utils/asyncWrapper.js';
import { assertValidFolder, generateUploadFilename } from '../utils/uploadFilename.js';

/**
 * Create middleware that uploads req.file (memory storage) to Vercel Blob
 * and sets req.vercelBlobURL. Continues without error when no file was uploaded.
 *
 * @param {string} folder
 * @param {{ put?: typeof blobPut }} [deps] injectable for tests
 */
export const createVercelBlobUploader = (folder, { put = blobPut } = {}) => {
  assertValidFolder(folder);

  return asyncWrapper(async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured. Please set it in your environment variables.');
    }

    const pathname = `${folder}/${generateUploadFilename(req.file.mimetype)}`;

    const blob = await put(pathname, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    req.vercelBlobURL = blob.url;
    next();
  });
};

export default createVercelBlobUploader('organizations');
