import { jest } from '@jest/globals';
import fileUploader from '../middlewares/fileUploader.js';
import { createStorage, getFileUrl, isProduction } from '../middlewares/storageHandler.js';

const LOCAL_URL = 'http://localhost/a.png';
const BLOB_URL = 'https://x.public.blob.vercel-storage.com/a.png';

describe('storageHandler', () => {
  const ORIGINAL_URL = process.env.URL;

  afterEach(() => {
    if (ORIGINAL_URL === undefined) {
      delete process.env.URL;
    } else {
      process.env.URL = ORIGINAL_URL;
    }
  });

  it('is not in production mode under test', () => {
    expect(isProduction).toBe(false);
  });

  describe('development storage', () => {
    it('uses a disk uploader, not the memory uploader', () => {
      const { uploader, urlGenerator } = createStorage('images', false);

      expect(typeof uploader.single).toBe('function');
      expect(uploader).not.toBe(fileUploader);
      expect(typeof urlGenerator).toBe('function');
    });

    it('urlGenerator sets a local URL in the requested folder', () => {
      process.env.URL = 'http://localhost:3000';
      const { urlGenerator } = createStorage('images', false);
      const req = { file: { filename: 'abc.png' } };
      const next = jest.fn();

      urlGenerator(req, {}, next);

      expect(req.localFileURL).toBe('http://localhost:3000/uploads/images/abc.png');
      expect(next).toHaveBeenCalledWith();
    });

    it('defaults to development storage when production is not passed', () => {
      expect(createStorage('images').uploader).not.toBe(fileUploader);
    });
  });

  describe('production storage', () => {
    it('uses the memory uploader for Vercel Blob', () => {
      const { uploader, urlGenerator } = createStorage('images', true);

      expect(uploader).toBe(fileUploader);
      expect(typeof urlGenerator).toBe('function');
    });
  });

  describe('getFileUrl', () => {
    const req = { localFileURL: LOCAL_URL, vercelBlobURL: BLOB_URL };

    it('returns the local URL in development', () => {
      expect(getFileUrl(req, false)).toBe(LOCAL_URL);
    });

    it('returns the Vercel URL in production', () => {
      expect(getFileUrl(req, true)).toBe(BLOB_URL);
    });

    it('defaults to the current environment', () => {
      expect(getFileUrl(req)).toBe(LOCAL_URL);
    });

    it('returns null when no URL was set', () => {
      expect(getFileUrl({}, false)).toBeNull();
      expect(getFileUrl({}, true)).toBeNull();
    });

    it('returns null when req is missing', () => {
      expect(getFileUrl(undefined)).toBeNull();
    });
  });

  it('rejects an unsafe folder name', () => {
    expect(() => createStorage('../secrets', false)).toThrow('Invalid upload folder');
    expect(() => createStorage('../secrets', true)).toThrow('Invalid upload folder');
  });
});
