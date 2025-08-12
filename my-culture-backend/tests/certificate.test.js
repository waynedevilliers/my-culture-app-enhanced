import { describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import certificateRouter from '../routes/certificateRouter.js';

// Only mock Certificate and CertificateRecipient for success/fetch tests
jest.mock('../db.js', () => ({
  Certificate: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  CertificateRecipient: {
    bulkCreate: jest.fn(),
  },
}));

import { Certificate, CertificateRecipient } from '../db.js';

const app = express();
app.use(express.json());

// Mock authentication and authorization middleware for CRUD tests
jest.mock('../middlewares/authenticate.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
}));
jest.mock('../middlewares/authorize.js', () => ({
  authorizeAdminOrSuperAdmin: (req, res, next) => next(),
}));
app.use('/api/certificates', certificateRouter);

const validCertificate = {
  title: 'Test Certificate',
  description: 'A test certificate.',
  issuedDate: '2025-08-06',
  issuedFrom: 'Test Org',
  templateId: 'elegant-gold',
  recipients: [
    { name: 'John Doe', email: 'john@example.com' },
  ],
};

describe('Certificate CRUD API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a certificate with valid data', async () => {
    Certificate.create.mockResolvedValue({ id: 1, ...validCertificate });
    CertificateRecipient.bulkCreate.mockResolvedValue(validCertificate.recipients);

    const res = await request(app)
      .post('/api/certificates')
      .send(validCertificate);

    expect(res.status).toBe(201);
    expect(res.body.certificate).toHaveProperty('id');
    expect(Certificate.create).toHaveBeenCalled();
    expect(CertificateRecipient.bulkCreate).toHaveBeenCalled();
  });

  // Remove model mocks for this test to trigger real validation
  test('should not create certificate with missing recipients', async () => {
    jest.unmock('../db.js');
    const invalidData = { ...validCertificate, recipients: [] };
    const appReal = express();
    appReal.use(express.json());
    appReal.use('/api/certificates', certificateRouter);
    const res = await request(appReal)
      .post('/api/certificates')
      .send(invalidData);
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('message');
  });

  test('should get all certificates (paginated)', async () => {
    Certificate.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [{ id: 1, ...validCertificate }],
    });
    const res = await request(app).get('/api/certificates?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThanOrEqual(1);
    expect(Certificate.findAndCountAll).toHaveBeenCalled();
  });

  test('should get a single certificate by id', async () => {
    Certificate.findByPk.mockResolvedValue({ id: 1, ...validCertificate });
    const res = await request(app).get('/api/certificates/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(Certificate.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
  });

  test('should return 404 for non-existent certificate', async () => {
    Certificate.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/certificates/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('message');
  });

  test('should update a certificate', async () => {
    Certificate.update.mockResolvedValue([1]);
    Certificate.findByPk.mockResolvedValue({ id: 1, ...validCertificate, title: 'Updated Title' });
    const res = await request(app)
      .put('/api/certificates/1')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('title', 'Updated Title');
    expect(Certificate.update).toHaveBeenCalled();
  });

  test('should return 404 when updating non-existent certificate', async () => {
    Certificate.update.mockResolvedValue([0]);
    const res = await request(app)
      .put('/api/certificates/999')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('message');
  });

  test('should delete a certificate', async () => {
    Certificate.destroy.mockResolvedValue(1);
    const res = await request(app).delete('/api/certificates/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(Certificate.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  test('should return 404 when deleting non-existent certificate', async () => {
    Certificate.destroy.mockResolvedValue(0);
    const res = await request(app).delete('/api/certificates/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('message');
  });
});

// Authentication test in a separate suite (no mock)
describe('Certificate API authentication', () => {
  const appNoAuth = express();
  appNoAuth.use(express.json());
  appNoAuth.use('/api/certificates', certificateRouter);

  test('should require authentication for protected routes', async () => {
    // Remove authentication mock for this test
    jest.unmock('../middlewares/authenticate.js');
    const res = await request(appNoAuth).post('/api/certificates').send(validCertificate);
    expect(res.status).toBe(401);
    expect(res.body.error).toHaveProperty('message');
  });
});
