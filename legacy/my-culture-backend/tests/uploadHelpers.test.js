import { isHttpUrl } from '../utils/urlValidator.js';
import { assertValidFolder, generateUploadFilename } from '../utils/uploadFilename.js';
import { SEED_IMAGES, getSeedImageUrl } from '../utils/seedImages.js';

describe('isHttpUrl', () => {
  it.each([
    'http://localhost:3000/uploads/images/a.png',
    'http://127.0.0.1:3001/uploads/a.png',
    'HTTP://LOCALHOST:3000/a.png',
    'https://abc123.public.blob.vercel-storage.com/images/a.png',
    'https://res.cloudinary.com/demo/image/upload/a.jpg',
  ])('accepts %s', (url) => {
    expect(isHttpUrl(url)).toBe(true);
  });

  it.each([
    ['an empty string', ''],
    ['a relative path', '/uploads/a.png'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a data: URL', 'data:image/png;base64,AAAA'],
    ['an ftp URL', 'ftp://example.com/a.png'],
    ['plain text', 'not a url'],
    ['a number', 42],
    ['null', null],
  ])('rejects %s', (_label, value) => {
    expect(isHttpUrl(value)).toBe(false);
  });
});

describe('generateUploadFilename', () => {
  it.each([
    ['image/png', '.png'],
    ['image/jpeg', '.jpg'],
    ['image/jpg', '.jpg'],
    ['image/webp', '.webp'],
  ])('uses the right extension for %s', (mimeType, extension) => {
    expect(generateUploadFilename(mimeType)).toMatch(new RegExp(`^\\d+-[0-9a-f]{24}\\${extension}$`));
  });

  it('generates a different name every time', () => {
    const names = new Set(Array.from({ length: 200 }, () => generateUploadFilename('image/png')));
    expect(names.size).toBe(200);
  });

  it('rejects types that are not allowed', () => {
    expect(() => generateUploadFilename('text/html')).toThrow('Unsupported image type');
  });
});

describe('assertValidFolder', () => {
  it('accepts a simple folder name', () => {
    expect(assertValidFolder('organizations')).toBe('organizations');
  });

  it.each(['', '..', '../x', 'a/b', 'A', 'with space', undefined])('rejects %p', (folder) => {
    expect(() => assertValidFolder(folder)).toThrow('Invalid upload folder');
  });
});

describe('getSeedImageUrl', () => {
  it('uses the local upload URL outside production', () => {
    expect(getSeedImageUrl('berlin-heritage.png', { NODE_ENV: 'development', URL: 'http://localhost:3000' }))
      .toBe('http://localhost:3000/uploads/organizations/berlin-heritage.png');
  });

  it('uses the hosted original in production, because local uploads are not deployed', () => {
    expect(getSeedImageUrl('berlin-heritage.png', { NODE_ENV: 'production', URL: 'https://api.example.com' }))
      .toBe(SEED_IMAGES['berlin-heritage.png']);
  });

  it('returns a valid http URL for every seed image in both environments', () => {
    for (const filename of Object.keys(SEED_IMAGES)) {
      expect(isHttpUrl(getSeedImageUrl(filename, { NODE_ENV: 'development' }))).toBe(true);
      expect(isHttpUrl(getSeedImageUrl(filename, { NODE_ENV: 'production' }))).toBe(true);
    }
  });

  it('throws for an unknown image', () => {
    expect(() => getSeedImageUrl('missing.png', {})).toThrow('Unknown seed image');
  });
});
