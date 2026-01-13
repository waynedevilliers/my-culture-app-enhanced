import { put } from '@vercel/blob';
import asyncWrapper from '../utils/asyncWrapper.js';
import crypto from 'crypto';
import path from 'path';

/**
 * Middleware to upload files to Vercel Blob storage
 * Works similar to localFileUrl but uses Vercel Blob for production
 */
const vercelBlobUploader = asyncWrapper(async (req, res, next) => {
  // If no file uploaded, continue without error (for optional uploads)
  if (!req.file) {
    return next();
  }

  // Check if Vercel Blob token is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured. Please set it in your environment variables.');
  }

  // Generate unique filename
  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  const ext = path.extname(req.file.originalname);
  const filename = `organizations/${uniqueSuffix}${ext}`;

  // Upload to Vercel Blob
  const blob = await put(filename, req.file.buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Store the Vercel Blob URL in req for use in controllers
  req.vercelBlobURL = blob.url;

  next();
});

export default vercelBlobUploader;
