import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { createLocalFileUploader, UPLOADS_ROOT } from '../middlewares/localFileUploader.js';
import { buildLocalFileUrl, createLocalFileUrl } from '../middlewares/localFileUrl.js';

const TEST_FOLDER = 'jest-upload-test';
const TEST_DIR = path.join(UPLOADS_ROOT, TEST_FOLDER);
const PNG_BYTES = Buffer.from('89504e470d0a1a0a', 'hex');

const buildApp = () => {
  const app = express();
  app.post(
    '/upload',
    createLocalFileUploader(TEST_FOLDER).single('image'),
    createLocalFileUrl(TEST_FOLDER),
    (req, res) => res.json({ filename: req.file?.filename, url: req.localFileURL }),
  );
  // Multer reports rejected files through the error handler.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => res.status(400).json({ message: err.message }));
  return app;
};

describe('local file storage', () => {
  const ORIGINAL_URL = process.env.URL;

  beforeEach(() => {
    process.env.URL = 'http://localhost:3000';
  });

  afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  afterAll(() => {
    if (ORIGINAL_URL === undefined) {
      delete process.env.URL;
    } else {
      process.env.URL = ORIGINAL_URL;
    }
  });

  it('saves an image to public/uploads/<folder> and returns its URL', async () => {
    const res = await request(buildApp())
      .post('/upload')
      .attach('image', PNG_BYTES, { filename: 'logo.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.filename).toMatch(/^\d+-[0-9a-f]{24}\.png$/);
    expect(res.body.url).toBe(`http://localhost:3000/uploads/${TEST_FOLDER}/${res.body.filename}`);
    expect(fs.readFileSync(path.join(TEST_DIR, res.body.filename))).toEqual(PNG_BYTES);
  });

  it('ignores the client file name, so it cannot choose the extension', async () => {
    const res = await request(buildApp())
      .post('/upload')
      .attach('image', PNG_BYTES, { filename: '../../evil.html', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.filename).toMatch(/\.png$/);
    expect(fs.readdirSync(TEST_DIR)).toEqual([res.body.filename]);
  });

  it('rejects files that are not images', async () => {
    const res = await request(buildApp())
      .post('/upload')
      .attach('image', Buffer.from('<script>'), { filename: 'a.html', contentType: 'text/html' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only jpg, png, jpeg or webp images are allowed/);
    expect(fs.existsSync(TEST_DIR) ? fs.readdirSync(TEST_DIR) : []).toEqual([]);
  });

  it('continues without a URL when no file was sent', async () => {
    const res = await request(buildApp()).post('/upload');

    expect(res.status).toBe(200);
    expect(res.body.url).toBeUndefined();
  });

  it('rejects an unsafe folder name', () => {
    expect(() => createLocalFileUploader('../public')).toThrow('Invalid upload folder');
    expect(() => createLocalFileUrl('')).toThrow('Invalid upload folder');
  });
});

describe('buildLocalFileUrl', () => {
  it('uses URL and strips a trailing slash', () => {
    expect(buildLocalFileUrl('images', 'a.png', { URL: 'https://api.example.com/' }))
      .toBe('https://api.example.com/uploads/images/a.png');
  });

  it('falls back to localhost and PORT', () => {
    expect(buildLocalFileUrl('images', 'a.png', { PORT: '3001' }))
      .toBe('http://localhost:3001/uploads/images/a.png');
  });

  it('falls back to port 3000', () => {
    expect(buildLocalFileUrl('images', 'a.png', {})).toBe('http://localhost:3000/uploads/images/a.png');
  });

  it('encodes the file name', () => {
    expect(buildLocalFileUrl('images', 'a b.png', {})).toBe('http://localhost:3000/uploads/images/a%20b.png');
  });

  it('works with a middleware call', () => {
    const next = jest.fn();
    const req = { file: { filename: 'x.webp' } };
    process.env.URL = 'http://localhost:3000';
    createLocalFileUrl('images')(req, {}, next);
    expect(req.localFileURL).toBe('http://localhost:3000/uploads/images/x.webp');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
