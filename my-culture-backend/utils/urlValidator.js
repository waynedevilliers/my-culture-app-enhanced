const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Check whether a value is an absolute http(s) URL.
 * Accepts localhost, IP addresses and any public host (for example Vercel Blob),
 * and treats the scheme and host case-insensitively, as the URL standard does.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isHttpUrl = (value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  try {
    return ALLOWED_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
};

export default isHttpUrl;
