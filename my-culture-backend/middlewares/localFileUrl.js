import { assertValidFolder } from '../utils/uploadFilename.js';

/**
 * Build the public URL of a file saved by the local uploader.
 *
 * @param {string} folder
 * @param {string} filename
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export const buildLocalFileUrl = (folder, filename, env = process.env) => {
  const baseUrl = (env.URL || `http://localhost:${env.PORT || 3000}`).replace(/\/+$/, '');
  return `${baseUrl}/uploads/${assertValidFolder(folder)}/${encodeURIComponent(filename)}`;
};

/**
 * Create middleware that sets req.localFileURL after a local upload.
 * Continues without error when no file was uploaded (optional uploads).
 *
 * @param {string} folder
 */
export const createLocalFileUrl = (folder) => {
  assertValidFolder(folder);

  return (req, res, next) => {
    if (req.file) {
      req.localFileURL = buildLocalFileUrl(folder, req.file.filename);
    }
    next();
  };
};

export default createLocalFileUrl('organizations');
