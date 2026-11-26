import { jest } from '@jest/globals';
import { Image } from '../db.js';
import { imageHandler } from '../controllers/image.js';

jest.mock('../db.js', () => ({ Image: { create: jest.fn() } }));

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const run = (req, res) => new Promise((resolve) => {
  const next = (error) => resolve(error);
  Promise.resolve(imageHandler(req, res, next)).then(() => resolve(undefined));
});

describe('imageHandler', () => {
  beforeEach(() => {
    Image.create.mockReset();
  });

  it('saves the uploaded file URL instead of a Cloudinary URL', async () => {
    Image.create.mockResolvedValue({ id: 1, name: 'logo', url: 'http://localhost:3000/uploads/images/a.png' });
    const req = {
      body: { name: 'logo' },
      user: { id: 7 },
      localFileURL: 'http://localhost:3000/uploads/images/a.png',
      cloudinaryURL: 'https://res.cloudinary.com/old.png',
    };
    const res = makeRes();

    const error = await run(req, res);

    expect(error).toBeUndefined();
    expect(Image.create).toHaveBeenCalledWith({
      name: 'logo',
      url: 'http://localhost:3000/uploads/images/a.png',
      userId: 7,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('does not let the request body override the URL or user', async () => {
    Image.create.mockResolvedValue({});
    const req = {
      body: { name: 'logo', url: 'https://evil.example.com/a.png', userId: 999 },
      user: { id: 7 },
      localFileURL: 'http://localhost:3000/uploads/images/a.png',
    };

    await run(req, makeRes());

    expect(Image.create).toHaveBeenCalledWith(expect.objectContaining({
      url: 'http://localhost:3000/uploads/images/a.png',
      userId: 7,
    }));
  });

  it('fails with a 500 when no file URL was produced', async () => {
    const req = { body: { name: 'logo' }, user: { id: 7 } };

    const error = await run(req, makeRes());

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Image upload failed');
    expect(error.statusCode).toBe(500);
    expect(Image.create).not.toHaveBeenCalled();
  });
});
