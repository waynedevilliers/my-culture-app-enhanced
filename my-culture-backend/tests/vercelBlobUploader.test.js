import { jest } from '@jest/globals';
import { put } from '@vercel/blob';
import { createVercelBlobUploader } from '../middlewares/vercelBlobUploader.js';

jest.mock('@vercel/blob', () => ({ put: jest.fn() }));

const ORIGINAL_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

/** asyncWrapper passes errors to next, so wait for next to be called. */
const run = (middleware, req) => new Promise((resolve) => {
  middleware(req, {}, (error) => resolve(error));
});

describe('vercelBlobUploader', () => {
  beforeEach(() => {
    put.mockReset();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  afterAll(() => {
    if (ORIGINAL_TOKEN === undefined) {
      delete process.env.BLOB_READ_WRITE_TOKEN;
    } else {
      process.env.BLOB_READ_WRITE_TOKEN = ORIGINAL_TOKEN;
    }
  });

  it('skips the upload when no file was sent', async () => {
    const req = {};
    const error = await run(createVercelBlobUploader('images'), req);

    expect(error).toBeUndefined();
    expect(put).not.toHaveBeenCalled();
    expect(req.vercelBlobURL).toBeUndefined();
  });

  it('uploads the buffer and sets req.vercelBlobURL', async () => {
    put.mockResolvedValue({ url: 'https://abc.public.blob.vercel-storage.com/images/x.png' });
    const buffer = Buffer.from('image-bytes');
    const req = { file: { originalname: 'photo.png', mimetype: 'image/png', buffer } };

    const error = await run(createVercelBlobUploader('images'), req);

    expect(error).toBeUndefined();
    expect(req.vercelBlobURL).toBe('https://abc.public.blob.vercel-storage.com/images/x.png');
    expect(put).toHaveBeenCalledTimes(1);

    const [pathname, body, options] = put.mock.calls[0];
    expect(pathname).toMatch(/^images\/\d+-[0-9a-f]{24}\.png$/);
    expect(body).toBe(buffer);
    expect(options).toEqual({ access: 'public', contentType: 'image/png', token: 'test-token' });
  });

  it('takes the extension from the MIME type, not the client file name', async () => {
    put.mockResolvedValue({ url: 'https://abc.public.blob.vercel-storage.com/images/x.jpg' });
    const req = { file: { originalname: 'evil.html', mimetype: 'image/jpeg', buffer: Buffer.from('x') } };

    await run(createVercelBlobUploader('images'), req);

    expect(put.mock.calls[0][0]).toMatch(/\.jpg$/);
  });

  it('fails with a clear error when BLOB_READ_WRITE_TOKEN is missing', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const req = { file: { originalname: 'a.png', mimetype: 'image/png', buffer: Buffer.from('x') } };

    const error = await run(createVercelBlobUploader('images'), req);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/BLOB_READ_WRITE_TOKEN is not configured/);
    expect(put).not.toHaveBeenCalled();
  });

  it('passes Vercel Blob errors to next', async () => {
    put.mockRejectedValue(new Error('Blob store unavailable'));
    const req = { file: { originalname: 'a.png', mimetype: 'image/png', buffer: Buffer.from('x') } };

    const error = await run(createVercelBlobUploader('images'), req);

    expect(error.message).toBe('Blob store unavailable');
    expect(req.vercelBlobURL).toBeUndefined();
  });

  it('rejects an unsafe folder name', () => {
    expect(() => createVercelBlobUploader('a/b')).toThrow('Invalid upload folder');
  });
});
