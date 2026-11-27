// Image storage and the upload route.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'fs/promises';
import os from 'os';
import path from 'path';

const blob = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock('@vercel/blob', () => blob);

const db = vi.hoisted(() => ({ image: { create: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({ prisma: db }));

import {
  detectImageType,
  ImageUploadError,
  MAX_IMAGE_BYTES,
  storeImage,
} from '@/lib/storage';
import { POST as upload } from '@/app/api/file/upload/route';
import { asUser, PNG_BYTES } from './helpers/requests';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);
const GIF = new TextEncoder().encode('GIF89a......');
const HTML = new TextEncoder().encode('<html><script>alert(1)</script>');

describe('detectImageType', () => {
  it.each([
    ['png', PNG_BYTES, 'png'],
    ['jpeg', JPEG, 'jpeg'],
    ['webp', WEBP, 'webp'],
    ['gif', GIF, null],
    ['html', HTML, null],
    ['empty', new Uint8Array(), null],
  ])('%s -> %s', (_label, bytes, expected) => {
    expect(detectImageType(bytes as Uint8Array)).toBe(expected);
  });
});

describe('storeImage', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), 'upload-test-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    blob.put.mockReset();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(tmp, { recursive: true, force: true });
  });

  it('writes to public/uploads in development, with a random name', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    const file = new File([PNG_BYTES], '../../evil.html', {
      type: 'text/html',
    });

    const stored = await storeImage(file, 'organizations');

    expect(stored.fileName).toMatch(/^\d+-[0-9a-f]{24}\.png$/);
    expect(stored.url).toBe(`/uploads/organizations/${stored.fileName}`);
    const written = await readFile(
      path.join(tmp, 'public', 'uploads', 'organizations', stored.fileName)
    );
    expect(new Uint8Array(written)).toEqual(PNG_BYTES);
  });

  it('uploads to Vercel Blob when a token is set', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob-token');
    blob.put.mockResolvedValue({
      url: 'https://x.public.blob.vercel-storage.com/images/a.jpg',
    });

    const stored = await storeImage(new File([JPEG], 'a.jpg'), 'images');

    expect(stored.url).toBe(
      'https://x.public.blob.vercel-storage.com/images/a.jpg'
    );
    const [pathname, , options] = blob.put.mock.calls[0];
    expect(pathname).toMatch(/^images\/\d+-[0-9a-f]{24}\.jpg$/);
    expect(options).toMatchObject({
      access: 'public',
      contentType: 'image/jpeg',
      token: 'blob-token',
    });
  });

  it('refuses to write to disk in production without a Blob token', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    vi.stubEnv('NODE_ENV', 'production');
    await expect(
      storeImage(new File([PNG_BYTES], 'a.png'), 'images')
    ).rejects.toThrow('BLOB_READ_WRITE_TOKEN is not set');
  });

  it.each([
    ['an empty file', new Uint8Array(), 'The file is empty'],
    ['a file that only claims to be an image', HTML, 'Only jpg, png or webp'],
    ['a GIF', GIF, 'Only jpg, png or webp'],
  ])('rejects %s', async (_label, bytes, message) => {
    const promise = storeImage(
      new File([bytes as Uint8Array<ArrayBuffer>], 'a.png', {
        type: 'image/png',
      }),
      'images'
    );
    await expect(promise).rejects.toBeInstanceOf(ImageUploadError);
    await expect(promise).rejects.toThrow(message);
  });

  it('rejects files over 10 MB', async () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(PNG_BYTES);
    await expect(
      storeImage(new File([big], 'big.png'), 'images')
    ).rejects.toThrow('at most 10 MB');
  });

  it('rejects an unsafe folder', async () => {
    await expect(
      storeImage(new File([PNG_BYTES], 'a.png'), '../x')
    ).rejects.toThrow('Invalid upload folder');
  });
});

describe('POST /api/file/upload', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(path.join(os.tmpdir(), 'upload-route-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tmp);
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    db.image.create.mockReset();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    await rm(tmp, { recursive: true, force: true });
  });

  const request = (
    form: FormData,
    headers: Record<string, string> = asUser('ADMIN', 7)
  ) =>
    new Request('http://localhost:3000/api/file/upload', {
      method: 'POST',
      body: form,
      headers,
    });

  it('stores the image and records the uploader', async () => {
    db.image.create.mockImplementation(async ({ data }) => ({
      id: 'img9',
      url: data.url,
      fileName: data.fileName,
    }));
    const form = new FormData();
    form.set('image', new File([PNG_BYTES], 'logo.png', { type: 'image/png' }));

    const res = await upload(request(form));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toMatchObject({ id: 'img9', name: 'logo.png' });
    expect(body.url).toMatch(/^\/uploads\/images\/.+\.png$/);
    expect(db.image.create.mock.calls[0][0].data.userId).toBe(7);
  });

  it('returns 401 without a user and 403 for a USER', async () => {
    const form = new FormData();
    form.set('image', new File([PNG_BYTES], 'a.png'));
    expect((await upload(request(form, {}))).status).toBe(401);
    expect((await upload(request(form, asUser('USER')))).status).toBe(403);
  });

  it('returns 400 without a file or for a non-image', async () => {
    expect((await upload(request(new FormData()))).status).toBe(400);
    const form = new FormData();
    form.set('image', new File([HTML], 'a.png', { type: 'image/png' }));
    const res = await upload(request(form));
    expect(res.status).toBe(400);
    expect(db.image.create).not.toHaveBeenCalled();
  });
});
