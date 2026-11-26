// Image storage: Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production),
// otherwise public/uploads on local disk (development only).

import { randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type ImageType = 'png' | 'jpeg' | 'webp';

const CONTENT_TYPES: Record<ImageType, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const EXTENSIONS: Record<ImageType, string> = {
  png: '.png',
  jpeg: '.jpg',
  webp: '.webp',
};

const FOLDER_PATTERN = /^[a-z0-9-]+$/;

export class ImageUploadError extends Error {}

/**
 * Detect the image type from the file's first bytes. The browser's content
 * type and file name are not trusted.
 */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, i) => bytes[offset + i] === byte);

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'png';
  }
  if (startsWith([0xff, 0xd8, 0xff])) return 'jpeg';
  // RIFF....WEBP
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'webp';
  }
  return null;
}

interface StoredImage {
  url: string;
  fileName: string;
  size: number;
}

/**
 * Validate and store an uploaded image under `folder`, with an unguessable
 * file name. Throws ImageUploadError for files that are not accepted.
 */
export async function storeImage(
  file: File,
  folder: string
): Promise<StoredImage> {
  if (!FOLDER_PATTERN.test(folder)) {
    throw new Error(`Invalid upload folder: ${folder}`);
  }
  if (file.size === 0) {
    throw new ImageUploadError('The file is empty');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageUploadError('Images can be at most 10 MB');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) {
    throw new ImageUploadError('Only jpg, png or webp images are allowed');
  }

  const fileName = `${Date.now()}-${randomBytes(12).toString('hex')}${EXTENSIONS[type]}`;
  const pathname = `${folder}/${fileName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, Buffer.from(bytes), {
      access: 'public',
      contentType: CONTENT_TYPES[type],
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url, fileName, size: bytes.length };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set: uploads need Vercel Blob in production'
    );
  }

  const directory = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), bytes);
  return { url: `/uploads/${pathname}`, fileName, size: bytes.length };
}
