import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../index.js';
import { Organization, User } from '../db.js';

// Mock external dependencies
jest.mock('../utils/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('Organization Approval System', () => {
  let testOrganization;
  let superAdminUser;
  let superAdminToken;

  beforeEach(async () => {
    // Clean up test data
    await User.destroy({ where: {}, force: true });
    await Organization.destroy({ where: {}, force: true });

    // Create super admin for approval tests
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    superAdminUser = await User.create({
      name: 'Super Admin',
      email: 'superadmin@test.com',
      password: hashedPassword,
      role: 'superAdmin',
      emailVerified: true
    });

    // Generate auth token for super admin
    const jwt = await import('jsonwebtoken');
    superAdminToken = jwt.default.sign(
      { userId: superAdminUser.id, role: 'superAdmin' },
      process.env.SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    // Clean up after each test
    await User.destroy({ where: {}, force: true });
    await Organization.destroy({ where: {}, force: true });
  });

  describe('POST /api/organizations/apply', () => {
    const validApplicationData = {
      name: 'Test Martial Arts Dojo',
      description: 'A test martial arts organization for testing purposes.',
      website: 'https://testdojo.com',
      phone: '+49123456789',
      email: 'info@testdojo.com',
      contactPerson: 'Test Contact',
      adminName: 'John Admin',
      adminEmail: 'admin@testdojo.com',
      logo: 'https://testdojo.com/logo.png'
    };

    test('should accept valid organization application', async () => {
      const response = await request(app)
        .post('/api/organizations/apply')
        .send(validApplicationData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Application submitted successfully',
        organizationId: expect.any(Number),
        status: 'pending',
        nextSteps: expect.any(String)
      });

      // Verify organization was created in database
      const org = await Organization.findByPk(response.body.organizationId);
      expect(org).toBeTruthy();
      expect(org.name).toBe(validApplicationData.name);
      expect(org.approvalStatus).toBe('pending');
      expect(org.adminEmail).toBe(validApplicationData.adminEmail);
      expect(org.adminName).toBe(validApplicationData.adminName);
      expect(org.published).toBe(false);
    });

    test('should reject duplicate organization name', async () => {
      // Create existing organization
      await Organization.create({
        ...validApplicationData,
        approvalStatus: 'approved'
      });

      const response = await request(app)
        .post('/api/organizations/apply')
        .send(validApplicationData)
        .expect(400);

      expect(response.body.error).toBe('Organization name already exists');
    });

    test('should reject duplicate admin email', async () => {
      // Create existing user with same admin email
      await User.create({
        name: 'Existing User',
        email: validApplicationData.adminEmail,
        password: 'hashedpassword',
        role: 'user'
      });

      const response = await request(app)
        .post('/api/organizations/apply')
        .send(validApplicationData)
        .expect(400);

      expect(response.body.error).toBe('Admin email is already registered');
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        name: 'Test Org'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/organizations/apply')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    test('should validate email formats', async () => {
      const invalidEmailData = {
        ...validApplicationData,
        adminEmail: 'not-an-email'
      };

      const response = await request(app)
        .post('/api/organizations/apply')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('should validate phone number format', async () => {
      const invalidPhoneData = {
        ...validApplicationData,
        phone: 'not-a-phone'
      };

      const response = await request(app)
        .post('/api/organizations/apply')
        .send(invalidPhoneData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('should enforce rate limiting', async () => {
      // Make 3 requests quickly (rate limit is 3 per 15 minutes)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/organizations/apply')
          .send({
            ...validApplicationData,
            name: `Test Org ${i}`,
            adminEmail: `admin${i}@testdojo.com`
          });
      }

      // 4th request should be rate limited
      const response = await request(app)
        .post('/api/organizations/apply')
        .send({
          ...validApplicationData,
          name: 'Test Org 4',
          adminEmail: 'admin4@testdojo.com'
        })
        .expect(429);

      expect(response.body.error).toContain('Too many applications');
    });
  });

  describe('GET /api/organizations/:id/status', () => {
    test('should return application status', async () => {
      const org = await Organization.create({
        name: 'Test Organization',
        description: 'Test description',
        adminName: 'Test Admin',
        adminEmail: 'admin@test.com',
        approvalStatus: 'pending'
      });

      const response = await request(app)
        .get(`/api/organizations/${org.id}/status`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        organizationId: org.id,
        name: 'Test Organization',
        status: 'pending',
        submittedAt: expect.any(String),
        processedAt: null
      });
    });

    test('should return 404 for non-existent organization', async () => {
      const response = await request(app)
        .get('/api/organizations/999/status')
        .expect(404);

      expect(response.body.error).toBe('Organization not found');
    });

    test('should enforce rate limiting on status checks', async () => {
      const org = await Organization.create({
        name: 'Test Organization',
        description: 'Test description',
        adminName: 'Test Admin',
        adminEmail: 'admin@test.com',
        approvalStatus: 'pending'
      });

      // Make 10 requests quickly (rate limit is 10 per 5 minutes)
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get(`/api/organizations/${org.id}/status`);
      }

      // 11th request should be rate limited
      const response = await request(app)
        .get(`/api/organizations/${org.id}/status`)
        .expect(429);

      expect(response.body.error).toContain('Too many status requests');
    });
  });

  describe('GET /api/admin/organizations/pending', () => {
    beforeEach(async () => {
      // Create some pending applications
      await Organization.bulkCreate([
        {
          name: 'Pending Org 1',
          description: 'First pending org',
          adminName: 'Admin 1',
          adminEmail: 'admin1@test.com',
          approvalStatus: 'pending'
        },
        {
          name: 'Pending Org 2',
          description: 'Second pending org',
          adminName: 'Admin 2',
          adminEmail: 'admin2@test.com',
          approvalStatus: 'pending'
        },
        {
          name: 'Approved Org',
          description: 'Already approved org',
          adminName: 'Admin 3',
          adminEmail: 'admin3@test.com',
          approvalStatus: 'approved'
        }
      ]);
    });

    test('should return pending applications for super admin', async () => {
      const response = await request(app)
        .get('/api/admin/organizations/pending')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.applications).toHaveLength(2);
      expect(response.body.applications[0].approvalStatus).toBe('pending');
      expect(response.body.applications[1].approvalStatus).toBe('pending');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/organizations/pending')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    test('should require superAdmin role', async () => {
      // Create regular admin user
      const regularAdmin = await User.create({
        name: 'Regular Admin',
        email: 'admin@test.com',
        password: await bcrypt.hash('password', 10),
        role: 'admin',
        organizationId: 1
      });

      const jwt = await import('jsonwebtoken');
      const adminToken = jwt.default.sign(
        { userId: regularAdmin.id, role: 'admin' },
        process.env.SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/admin/organizations/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/admin/organizations/process', () => {
    let pendingOrg;

    beforeEach(async () => {
      pendingOrg = await Organization.create({
        name: 'Test Pending Organization',
        description: 'A test organization pending approval',
        adminName: 'Test Admin',
        adminEmail: 'testadmin@test.com',
        approvalStatus: 'pending'
      });
    });

    test('should approve organization and create admin user', async () => {
      const approvalData = {
        organizationId: pendingOrg.id,
        decision: 'approved',
        adminPassword: 'SecurePassword123!',
        notes: 'Approved after review'
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(approvalData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('approved');
      expect(response.body.adminUserId).toBeDefined();

      // Verify organization was updated
      await pendingOrg.reload();
      expect(pendingOrg.approvalStatus).toBe('approved');
      expect(pendingOrg.approvedAt).toBeTruthy();
      expect(pendingOrg.published).toBe(true);
      expect(pendingOrg.emailVerified).toBe(true);

      // Verify admin user was created
      const adminUser = await User.findByPk(response.body.adminUserId);
      expect(adminUser).toBeTruthy();
      expect(adminUser.name).toBe('Test Admin');
      expect(adminUser.email).toBe('testadmin@test.com');
      expect(adminUser.role).toBe('admin');
      expect(adminUser.organizationId).toBe(pendingOrg.id);
      expect(adminUser.emailVerified).toBe(true);

      // Verify password was set correctly
      const passwordMatch = await bcrypt.compare('SecurePassword123!', adminUser.password);
      expect(passwordMatch).toBe(true);
    });

    test('should reject organization', async () => {
      const rejectionData = {
        organizationId: pendingOrg.id,
        decision: 'rejected',
        notes: 'Does not meet requirements'
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(rejectionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('rejected');

      // Verify organization was updated
      await pendingOrg.reload();
      expect(pendingOrg.approvalStatus).toBe('rejected');
      expect(pendingOrg.rejectedAt).toBeTruthy();
      expect(pendingOrg.published).toBe(false);

      // Verify no admin user was created
      const adminUser = await User.findOne({
        where: { email: 'testadmin@test.com' }
      });
      expect(adminUser).toBeNull();
    });

    test('should generate temporary password if not provided', async () => {
      const approvalData = {
        organizationId: pendingOrg.id,
        decision: 'approved'
        // No adminPassword provided
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(approvalData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify admin user was created with some password
      const adminUser = await User.findByPk(response.body.adminUserId);
      expect(adminUser).toBeTruthy();
      expect(adminUser.password).toBeTruthy();
      expect(adminUser.password.length).toBeGreaterThan(10); // Hashed password
    });

    test('should return 404 for non-existent organization', async () => {
      const approvalData = {
        organizationId: 999,
        decision: 'approved'
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(approvalData)
        .expect(404);

      expect(response.body.error).toBe('Pending organization application not found');
    });

    test('should return 404 for already processed organization', async () => {
      // Mark organization as already approved
      await pendingOrg.update({
        approvalStatus: 'approved',
        approvedAt: new Date()
      });

      const approvalData = {
        organizationId: pendingOrg.id,
        decision: 'approved'
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(approvalData)
        .expect(404);

      expect(response.body.error).toBe('Pending organization application not found');
    });

    test('should validate input parameters', async () => {
      const invalidData = {
        organizationId: 'not-a-number',
        decision: 'invalid-decision'
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    test('should require authentication', async () => {
      const approvalData = {
        organizationId: pendingOrg.id,
        decision: 'approved'
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .send(approvalData)
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    test('should require superAdmin role', async () => {
      // Create regular admin user
      const regularAdmin = await User.create({
        name: 'Regular Admin',
        email: 'regularadmin@test.com',
        password: await bcrypt.hash('password', 10),
        role: 'admin',
        organizationId: 1
      });

      const jwt = await import('jsonwebtoken');
      const adminToken = jwt.default.sign(
        { userId: regularAdmin.id, role: 'admin' },
        process.env.SECRET,
        { expiresIn: '1h' }
      );

      const approvalData = {
        organizationId: pendingOrg.id,
        decision: 'approved'
      };

      const response = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(approvalData)
        .expect(403);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('complete application workflow', async () => {
      const applicationData = {
        name: 'Complete Workflow Test Org',
        description: 'Testing complete workflow from application to approval.',
        adminName: 'Workflow Admin',
        adminEmail: 'workflow@test.com'
      };

      // 1. Submit application
      const applicationResponse = await request(app)
        .post('/api/organizations/apply')
        .send(applicationData);

      expect(applicationResponse.status).toBe(201);
      const orgId = applicationResponse.body.organizationId;

      // 2. Check status (should be pending)
      const statusResponse = await request(app)
        .get(`/api/organizations/${orgId}/status`);

      expect(statusResponse.body.status).toBe('pending');

      // 3. Super admin gets pending applications
      const pendingResponse = await request(app)
        .get('/api/admin/organizations/pending')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(pendingResponse.body.count).toBeGreaterThan(0);
      const pendingApp = pendingResponse.body.applications.find(app => app.id === orgId);
      expect(pendingApp).toBeTruthy();

      // 4. Super admin approves application
      const approvalResponse = await request(app)
        .post('/api/admin/organizations/process')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          organizationId: orgId,
          decision: 'approved',
          adminPassword: 'NewAdminPassword123!'
        });

      expect(approvalResponse.status).toBe(200);
      expect(approvalResponse.body.success).toBe(true);

      // 5. Check final status (should be approved)
      const finalStatusResponse = await request(app)
        .get(`/api/organizations/${orgId}/status`);

      expect(finalStatusResponse.body.status).toBe('approved');
      expect(finalStatusResponse.body.processedAt).toBeTruthy();

      // 6. Verify admin can login
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'workflow@test.com',
          password: 'NewAdminPassword123!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.user.role).toBe('admin');
      expect(loginResponse.body.user.organizationId).toBe(orgId);
    });
  });
});