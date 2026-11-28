import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  assertValidFolder,
  generateUploadFilename,
} from '../utils/uploadFilename.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Same base folder that index.js serves at /uploads (path.resolve() = working directory).
export const UPLOADS_ROOT = path.join(path.resolve(), 'public', 'uploads');

export const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, png, jpeg or webp images are allowed'));
  }
};

/**
 * Create a multer instance that saves images to public/uploads/<folder>.
 * Used in development only; Vercel's filesystem is read-only.
 *
 * @param {string} folder single path segment, for example "organizations"
 */
export const createLocalFileUploader = (folder) => {
  const uploadPath = path.join(UPLOADS_ROOT, assertValidFolder(folder));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, generateUploadFilename(file.mimetype));
    },
  });

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
};

export default createLocalFileUploader('organizations');
