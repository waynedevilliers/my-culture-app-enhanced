import crypto from 'crypto';

/**
 * File extensions for the image types the uploaders accept.
 * The extension comes from the validated MIME type, never from the
 * client-supplied file name.
 */
export const EXTENSION_BY_MIME_TYPE = Object.freeze({
  'image/png': '.png',
  'image/jpg': '.jpg',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
});

export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze(Object.keys(EXTENSION_BY_MIME_TYPE));

const FOLDER_PATTERN = /^[a-z0-9-]+$/;

/**
 * Ensure an upload folder name is a single safe path segment.
 *
 * @param {string} folder
 * @returns {string}
 */
export const assertValidFolder = (folder) => {
  if (typeof folder !== 'string' || !FOLDER_PATTERN.test(folder)) {
    throw new Error(`Invalid upload folder: ${folder}`);
  }
  return folder;
};

/**
 * Generate an unguessable file name for an uploaded image.
 *
 * @param {string} mimeType
 * @returns {string} for example "1736414603000-3f9a1c2b7d4e6a8b0c1d2e3f.png"
 */
export const generateUploadFilename = (mimeType) => {
  const extension = EXTENSION_BY_MIME_TYPE[mimeType];
  if (!extension) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }
  return `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`;
};
