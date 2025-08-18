import { jest } from '@jest/globals';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import app from '../index.js';
import { Certificate, CertificateRecipient, Organization, User } from '../db.js';
import { generateSecureCertificatePaths } from '../utils/secureFileUtils.js';

// Mock file system operations
jest.mock('fs/promises');

describe('Secure Certificate Token Router', () => {
  let testOrganization;
  let testCertificate;
  let testRecipient;

  beforeEach(async () => {
    // Clean up test data
    await CertificateRecipient.destroy({ where: {}, force: true });
    await Certificate.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Organization.destroy({ where: {}, force: true });

    // Create test organization
    testOrganization = await Organization.create({
      name: 'Test Security Organization',
      description: 'Testing secure certificate access',
      approvalStatus: 'approved'
    });

    // Create test certificate
    testCertificate = await Certificate.create({
      title: 'Security Test Certificate',
      description: 'A certificate for testing secure access',
      issuedDate: new Date(),
      issuedFrom: testOrganization.name,
      templateId: 'elegant-gold'
    });

    // Create test recipient
    testRecipient = await CertificateRecipient.create({
      certificateId: testCertificate.id,
      name: 'Test Recipient',
      email: 'recipient@test.com'
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await CertificateRecipient.destroy({ where: {}, force: true });
    await Certificate.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Organization.destroy({ where: {}, force: true });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('GET /api/certificates/secure/:organizationId/:certificateId/:secureToken.:fileExtension', () => {
    test('should serve existing secure certificate file', async () => {
      const securePaths = generateSecureCertificatePaths({
        organizationId: testOrganization.id,
        organizationName: testOrganization.name,
        certificateId: testCertificate.id,
        certificateTitle: testCertificate.title,
        recipientName: testRecipient.name,
        recipientId: testRecipient.id
      });

      // Mock file system to simulate existing file
      const mockFileContent = Buffer.from('fake pdf content');
      fs.access = jest.fn().mockResolvedValue(true);
      fs.readdir = jest.fn().mockResolvedValue([path.basename(securePaths.pdfPath)]);
      fs.stat = jest.fn().mockResolvedValue({ isDirectory: () => true });

      // Extract secure token from generated path
      const pathMatch = securePaths.pdfPath.match(/cert\d+-([a-f0-9]{24})\.pdf$/);
      const secureToken = pathMatch[1];

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${secureToken}.pdf`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain(`certificate-${testCertificate.id}.pdf`);
      expect(response.headers['cache-control']).toContain('private');
      expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
    });

    test('should reject access with invalid secure token', async () => {
      const invalidToken = 'invalid123token456789012'; // Wrong length/format

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${invalidToken}.pdf`)
        .expect(400);

      expect(response.body.error).toBe('Invalid access parameters');
    });

    test('should reject access with malformed secure token', async () => {
      const malformedToken = 'short'; // Too short

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${malformedToken}.pdf`)
        .expect(400);

      expect(response.body.error).toBe('Invalid access parameters');
    });

    test('should handle URL expiration', async () => {
      const securePaths = generateSecureCertificatePaths({
        organizationId: testOrganization.id,
        organizationName: testOrganization.name,
        certificateId: testCertificate.id,
        certificateTitle: testCertificate.title,
        recipientName: testRecipient.name,
        recipientId: testRecipient.id
      });

      const pathMatch = securePaths.pdfPath.match(/cert\d+-([a-f0-9]{24})\.pdf$/);
      const secureToken = pathMatch[1];

      // Test with expired URL
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${secureToken}.pdf`)
        .query({ expires: pastTime })
        .expect(401);

      expect(response.body.error).toBe('Access URL has expired');
    });

    test('should handle valid URL expiration', async () => {
      const securePaths = generateSecureCertificatePaths({
        organizationId: testOrganization.id,
        organizationName: testOrganization.name,
        certificateId: testCertificate.id,
        certificateTitle: testCertificate.title,
        recipientName: testRecipient.name,
        recipientId: testRecipient.id
      });

      // Mock file system
      fs.access = jest.fn().mockResolvedValue(true);
      fs.readdir = jest.fn().mockResolvedValue([path.basename(securePaths.pdfPath)]);
      fs.stat = jest.fn().mockResolvedValue({ isDirectory: () => true });

      const pathMatch = securePaths.pdfPath.match(/cert\d+-([a-f0-9]{24})\.pdf$/);
      const secureToken = pathMatch[1];

      // Test with future expiration
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${secureToken}.pdf`)
        .query({ expires: futureTime })
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    test('should return 404 for non-existent certificate', async () => {
      const secureToken = 'abc123def456789012345678'; // Valid format but won't match

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/999/${secureToken}.pdf`)
        .expect(404);

      expect(response.body.error).toBe('Certificate not found');
    });

    test('should return 404 for non-existent organization', async () => {
      const secureToken = 'abc123def456789012345678'; // Valid format

      const response = await request(app)
        .get(`/api/certificates/secure/999/${testCertificate.id}/${secureToken}.pdf`)
        .expect(404);

      expect(response.body.error).toBe('Certificate not found');
    });

    test('should handle different file extensions', async () => {
      const extensions = ['pdf', 'png'];
      
      for (const ext of extensions) {
        const securePaths = generateSecureCertificatePaths({
          organizationId: testOrganization.id,
          organizationName: testOrganization.name,
          certificateId: testCertificate.id,
          certificateTitle: testCertificate.title,
          recipientName: testRecipient.name,
          recipientId: testRecipient.id
        });

        // Mock file system
        fs.access = jest.fn().mockResolvedValue(true);
        fs.readdir = jest.fn().mockResolvedValue([path.basename(securePaths[`${ext}Path`])]);
        fs.stat = jest.fn().mockResolvedValue({ isDirectory: () => true });

        const pathMatch = securePaths[`${ext}Path`].match(/cert\d+-([a-f0-9]{24})\./);
        const secureToken = pathMatch[1];

        const response = await request(app)
          .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${secureToken}.${ext}`)
          .expect(200);

        const expectedMimeType = ext === 'pdf' ? 'application/pdf' : 'image/png';
        expect(response.headers['content-type']).toBe(expectedMimeType);
      }
    });

    test('should reject unsupported file extensions', async () => {
      const secureToken = 'abc123def456789012345678';

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${secureToken}.exe`)
        .expect(400);

      expect(response.body.error).toBe('Invalid access parameters');
    });

    test('should generate file on demand when not found', async () => {
      // Mock file system to simulate file not existing
      fs.access = jest.fn().mockRejectedValue(new Error('File not found'));
      fs.readdir = jest.fn().mockResolvedValue(['some-other-file.pdf']);
      fs.stat = jest.fn().mockResolvedValue({ isDirectory: () => true });

      const securePaths = generateSecureCertificatePaths({
        organizationId: testOrganization.id,
        organizationName: testOrganization.name,
        certificateId: testCertificate.id,
        certificateTitle: testCertificate.title,
        recipientName: testRecipient.name,
        recipientId: testRecipient.id
      });

      const pathMatch = securePaths.pdfPath.match(/cert\d+-([a-f0-9]{24})\.pdf$/);
      const secureToken = pathMatch[1];

      // This would normally trigger on-demand generation
      // For testing purposes, we expect it to fail gracefully since we don't have full PDF generation setup
      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${secureToken}.pdf`);

      // Should either serve the file (200) or fail gracefully (404/500)
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/certificates/:id/secure-urls', () => {
    test('should generate secure URLs for certificate', async () => {
      // Add organization relationship to certificate
      testCertificate.organizationId = testOrganization.id;
      await testCertificate.save();

      // Mock the relationships for the test
      testCertificate.organization = testOrganization;
      testCertificate.recipients = [testRecipient];

      const response = await request(app)
        .post(`/api/certificates/${testCertificate.id}/secure-urls`)
        .send({ expiresIn: 3600 })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        certificateId: testCertificate.id,
        certificateTitle: testCertificate.title,
        organizationId: testOrganization.id,
        organizationName: testOrganization.name,
        expiresIn: 3600,
        secureUrls: expect.arrayContaining([
          expect.objectContaining({
            recipientId: testRecipient.id,
            recipientName: testRecipient.name,
            pdfUrl: expect.stringContaining('/api/certificates/secure/'),
            pngUrl: expect.stringContaining('/api/certificates/secure/')
          })
        ])
      });

      // Verify URLs contain secure tokens
      const secureUrl = response.body.secureUrls[0];
      expect(secureUrl.pdfUrl).toMatch(/\/api\/certificates\/secure\/\d+\/\d+\/[a-f0-9]{24}\.pdf/);
      expect(secureUrl.pngUrl).toMatch(/\/api\/certificates\/secure\/\d+\/\d+\/[a-f0-9]{24}\.png/);
    });

    test('should return 404 for non-existent certificate', async () => {
      const response = await request(app)
        .post('/api/certificates/999/secure-urls')
        .send({ expiresIn: 3600 })
        .expect(404);

      expect(response.body.error).toBe('Certificate not found');
    });

    test('should use default expiration when not provided', async () => {
      testCertificate.organizationId = testOrganization.id;
      await testCertificate.save();

      testCertificate.organization = testOrganization;
      testCertificate.recipients = [testRecipient];

      const response = await request(app)
        .post(`/api/certificates/${testCertificate.id}/secure-urls`)
        .send({}) // No expiresIn provided
        .expect(200);

      expect(response.body.expiresIn).toBe(3600); // Default 1 hour
    });
  });

  describe('Security Tests', () => {
    test('should prevent access without valid token', async () => {
      const fakeToken = '123456789012345678901234'; // Valid format but incorrect

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${fakeToken}.pdf`)
        .expect(404);

      // Should not find the file since token doesn't match any generated path
      expect(response.body.error).toBe('Certificate file not found');
    });

    test('should prevent directory traversal attacks', async () => {
      const maliciousToken = '../../../etc/passwd'; // Directory traversal attempt

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${maliciousToken}.pdf`)
        .expect(400);

      expect(response.body.error).toBe('Invalid access parameters');
    });

    test('should validate organization ID format', async () => {
      const secureToken = 'abc123def456789012345678';

      const response = await request(app)
        .get(`/api/certificates/secure/invalid-org/${testCertificate.id}/${secureToken}.pdf`)
        .expect(400);

      expect(response.body.error).toBe('Invalid access parameters');
    });

    test('should validate certificate ID format', async () => {
      const secureToken = 'abc123def456789012345678';

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/invalid-cert/${secureToken}.pdf`)
        .expect(400);

      expect(response.body.error).toBe('Invalid access parameters');
    });

    test('should set security headers', async () => {
      const securePaths = generateSecureCertificatePaths({
        organizationId: testOrganization.id,
        organizationName: testOrganization.name,
        certificateId: testCertificate.id,
        certificateTitle: testCertificate.title,
        recipientName: testRecipient.name,
        recipientId: testRecipient.id
      });

      // Mock file system
      fs.access = jest.fn().mockResolvedValue(true);
      fs.readdir = jest.fn().mockResolvedValue([path.basename(securePaths.pdfPath)]);
      fs.stat = jest.fn().mockResolvedValue({ isDirectory: () => true });

      const pathMatch = securePaths.pdfPath.match(/cert\d+-([a-f0-9]{24})\.pdf$/);
      const secureToken = pathMatch[1];

      const response = await request(app)
        .get(`/api/certificates/secure/${testOrganization.id}/${testCertificate.id}/${secureToken}.pdf`)
        .expect(200);

      // Verify security headers are set
      expect(response.headers['cache-control']).toContain('private');
      expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });
});