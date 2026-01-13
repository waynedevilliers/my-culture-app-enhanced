import asyncWrapper from '../utils/asyncWrapper.js';

/**
 * Middleware to construct local file URL after file upload
 * Works similar to cloudUploader but for local filesystem
 */
const localFileUrl = asyncWrapper(async (req, res, next) => {
  // If no file uploaded, continue without error (for optional uploads)
  if (!req.file) {
    return next();
  }

  // Construct the URL for the uploaded file
  // In development: http://localhost:3000/uploads/organizations/filename.jpg
  // In production: https://your-domain.com/uploads/organizations/filename.jpg
  const baseUrl = process.env.URL || `http://localhost:${process.env.PORT || 3000}`;
  const fileUrl = `${baseUrl}/uploads/organizations/${req.file.filename}`;

  // Store the URL in req for use in controllers
  req.localFileURL = fileUrl;

  next();
});

export default localFileUrl;
