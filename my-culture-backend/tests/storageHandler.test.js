import { jest } from '@jest/globals';

jest.mock('@vercel/blob', () => ({ put: jest.fn() }));

const ORIGINAL_ENV = process.env;

/**
 * Load storageHandler with a given NODE_ENV. isProduction is read once at
 * module load, so each environment needs a fresh module registry.
 */
const loadStorageHandler = (nodeEnv) => {
  process.env = { ...ORIGINAL_ENV, NODE_ENV: nodeEnv };
  let modules;
  jest.isolateModules(() => {
    modules = {
      storage: require('../middlewares/storageHandler.js'),
      fileUploader: require('../middlewares/fileUploader.js').default,
    };
  });
  return modules;
};

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('storageHandler', () => {
  describe('in development', () => {
    it('reports not production', () => {
      const { storage } = loadStorageHandler('development');
      expect(storage.isProduction).toBe(false);
    });

    it('createStorage returns a disk uploader, not the memory uploader', () => {
      const { storage, fileUploader } = loadStorageHandler('development');
      const { uploader, urlGenerator } = storage.createStorage('images');

      expect(typeof uploader.single).toBe('function');
      expect(uploader).not.toBe(fileUploader);
      expect(typeof urlGenerator).toBe('function');
    });

    it('urlGenerator sets a local URL in the requested folder', () => {
      const { storage } = loadStorageHandler('development');
      process.env.URL = 'http://localhost:3000';
      const { urlGenerator } = storage.createStorage('images');
      const req = { file: { filename: 'abc.png' } };
      const next = jest.fn();

      urlGenerator(req, {}, next);

      expect(req.localFileURL).toBe('http://localhost:3000/uploads/images/abc.png');
      expect(next).toHaveBeenCalledWith();
    });

    it('getFileUrl returns the local URL and ignores a Vercel URL', () => {
      const { storage } = loadStorageHandler('development');
      const req = { localFileURL: 'http://localhost/a.png', vercelBlobURL: 'https://x.public.blob.vercel-storage.com/a.png' };
      expect(storage.getFileUrl(req)).toBe('http://localhost/a.png');
    });
  });

  describe('in production', () => {
    it('reports production', () => {
      const { storage } = loadStorageHandler('production');
      expect(storage.isProduction).toBe(true);
    });

    it('createStorage returns the memory uploader', () => {
      const { storage, fileUploader } = loadStorageHandler('production');
      expect(storage.createStorage('images').uploader).toBe(fileUploader);
      expect(storage.fileStorageUploader).toBe(fileUploader);
    });

    it('getFileUrl returns the Vercel URL and ignores a local URL', () => {
      const { storage } = loadStorageHandler('production');
      const req = { localFileURL: 'http://localhost/a.png', vercelBlobURL: 'https://x.public.blob.vercel-storage.com/a.png' };
      expect(storage.getFileUrl(req)).toBe('https://x.public.blob.vercel-storage.com/a.png');
    });
  });

  describe('getFileUrl edge cases', () => {
    it('returns null when no URL was set', () => {
      const { storage } = loadStorageHandler('development');
      expect(storage.getFileUrl({})).toBeNull();
    });

    it('returns null when req is missing', () => {
      const { storage } = loadStorageHandler('development');
      expect(storage.getFileUrl(undefined)).toBeNull();
    });
  });

  it('rejects an unsafe folder name', () => {
    const { storage } = loadStorageHandler('development');
    expect(() => storage.createStorage('../secrets')).toThrow('Invalid upload folder');
  });
});
