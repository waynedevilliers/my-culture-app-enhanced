import { z } from 'zod';
import { Organization, User } from '../db.js';
import { generateSecureToken } from '../utils/secureFileUtils.js';
import bcrypt from 'bcryptjs';
import asyncWrapper from '../utils/asyncWrapper.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import logger from '../utils/logger.js';

// Validation schemas
const organizationApplicationSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(3).max(5000),
  website: z.string().url().optional(),
  phone: z.string().regex(/^\+(?:[0-9] ?){6,14}[0-9]$/).optional(),
  email: z.string().email().optional(),
  contactPerson: z.string().min(2).max(255).optional(),
  adminName: z.string().min(2).max(255),
  adminEmail: z.string().email(),
  logo: z.string().url().optional()
});

const approvalDecisionSchema = z.object({
  organizationId: z.number().int().positive(),
  decision: z.enum(['approved', 'rejected']),
  adminPassword: z.string().min(8).max(128).optional(), // Only for approved applications
  notes: z.string().max(1000).optional()
});

const adminCredentialsSchema = z.object({
  adminName: z.string().min(2).max(255),
  adminEmail: z.string().email(),
  organizationId: z.number().int().positive()
});

/**
 * Submit organization application
 * POST /api/organizations/apply
 */
export const submitApplication = asyncWrapper(async (req, res) => {
  try {
    const validatedData = organizationApplicationSchema.parse(req.body);
    
    // Check if organization name already exists
    const existingOrg = await Organization.findOne({
      where: { name: validatedData.name }
    });
    
    if (existingOrg) {
      throw new ErrorResponse('Organization name already exists', 400);
    }
    
    // Check if admin email is already in use
    const existingUser = await User.findOne({
      where: { email: validatedData.adminEmail }
    });
    
    if (existingUser) {
      throw new ErrorResponse('Admin email is already registered', 400);
    }
    
    // Create organization with pending status
    const organization = await Organization.create({
      ...validatedData,
      approvalStatus: 'pending',
      published: false, // Will be set to true upon approval
      emailVerified: false
    });
    
    logger.info(`Organization application submitted`, {
      organizationId: organization.id,
      organizationName: organization.name,
      adminEmail: organization.adminEmail,
      clientIp: req.ip
    });
    
    // Send notification emails (implement based on your email service)
    await sendApplicationNotifications(organization);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      organizationId: organization.id,
      status: 'pending',
      nextSteps: 'Your application is under review. You will receive an email notification once approved.'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }
    
    logger.error(`Error submitting organization application: ${error.message}`, {
      requestBody: req.body,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to submit application'
    });
  }
});

/**
 * Get pending applications (admin only)
 * GET /api/admin/organizations/pending
 */
export const getPendingApplications = asyncWrapper(async (req, res) => {
  try {
    const pendingOrganizations = await Organization.findAll({
      where: {
        approvalStatus: 'pending'
      },
      order: [['createdAt', 'ASC']],
      attributes: [
        'id', 'name', 'description', 'website', 'phone', 'email',
        'contactPerson', 'adminName', 'adminEmail', 'logo',
        'approvalStatus', 'createdAt'
      ]
    });
    
    res.json({
      success: true,
      count: pendingOrganizations.length,
      applications: pendingOrganizations
    });
    
  } catch (error) {
    logger.error(`Error fetching pending applications: ${error.message}`);
    
    res.status(500).json({
      error: 'Failed to fetch pending applications'
    });
  }
});

/**
 * Approve or reject organization application
 * POST /api/admin/organizations/approve
 */
export const processApplication = asyncWrapper(async (req, res) => {
  try {
    const validatedData = approvalDecisionSchema.parse(req.body);
    const { organizationId, decision, adminPassword, notes } = validatedData;
    
    // Find pending organization
    const organization = await Organization.findOne({
      where: {
        id: organizationId,
        approvalStatus: 'pending'
      }
    });
    
    if (!organization) {
      throw new ErrorResponse('Pending organization application not found', 404);
    }
    
    if (decision === 'approved') {
      // Create admin user account
      const adminUser = await createAdminUser({
        adminName: organization.adminName,
        adminEmail: organization.adminEmail,
        organizationId: organization.id,
        password: adminPassword || generateTemporaryPassword()
      });
      
      // Update organization status
      await organization.update({
        approvalStatus: 'approved',
        approvedAt: new Date(),
        adminUserId: adminUser.id,
        published: true,
        emailVerified: true
      });
      
      logger.info(`Organization application approved`, {
        organizationId: organization.id,
        organizationName: organization.name,
        adminUserId: adminUser.id,
        adminEmail: organization.adminEmail,
        approvedBy: req.user?.id
      });
      
      // Send approval notification with credentials
      await sendApprovalNotification(organization, adminUser, adminPassword);
      
      res.json({
        success: true,
        message: 'Organization application approved',
        organizationId: organization.id,
        adminUserId: adminUser.id,
        status: 'approved'
      });
      
    } else if (decision === 'rejected') {
      // Update organization status
      await organization.update({
        approvalStatus: 'rejected',
        rejectedAt: new Date()
      });
      
      logger.info(`Organization application rejected`, {
        organizationId: organization.id,
        organizationName: organization.name,
        adminEmail: organization.adminEmail,
        rejectedBy: req.user?.id,
        reason: notes
      });
      
      // Send rejection notification
      await sendRejectionNotification(organization, notes);
      
      res.json({
        success: true,
        message: 'Organization application rejected',
        organizationId: organization.id,
        status: 'rejected'
      });
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }
    
    logger.error(`Error processing organization application: ${error.message}`, {
      requestBody: req.body,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to process application'
    });
  }
});

/**
 * Get application status
 * GET /api/organizations/:id/status
 */
export const getApplicationStatus = asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;
    
    const organization = await Organization.findByPk(id, {
      attributes: [
        'id', 'name', 'approvalStatus', 'createdAt',
        'approvedAt', 'rejectedAt'
      ]
    });
    
    if (!organization) {
      throw new ErrorResponse('Organization not found', 404);
    }
    
    res.json({
      success: true,
      organizationId: organization.id,
      name: organization.name,
      status: organization.approvalStatus,
      submittedAt: organization.createdAt,
      processedAt: organization.approvedAt || organization.rejectedAt
    });
    
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }
    
    logger.error(`Error fetching application status: ${error.message}`, {
      organizationId: req.params.id,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to fetch application status'
    });
  }
});

/**
 * Helper function to create admin user
 */
async function createAdminUser({ adminName, adminEmail, organizationId, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const adminUser = await User.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'admin', // Organization admin (not superAdmin)
    organizationId: organizationId,
    emailVerified: true
  });
  
  return adminUser;
}

/**
 * Generate temporary password
 */
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Send application notifications
 */
async function sendApplicationNotifications(organization) {
  try {
    // Send confirmation email to applicant
    // Send notification email to system administrators
    // Implementation depends on your email service setup
    
    logger.info(`Application notifications sent`, {
      organizationId: organization.id,
      adminEmail: organization.adminEmail
    });
  } catch (error) {
    logger.error(`Failed to send application notifications: ${error.message}`);
  }
}

/**
 * Send approval notification with admin credentials
 */
async function sendApprovalNotification(organization, adminUser, password) {
  try {
    // Send welcome email with login credentials
    // Include instructions for first login and password change
    
    logger.info(`Approval notification sent`, {
      organizationId: organization.id,
      adminUserId: adminUser.id,
      adminEmail: organization.adminEmail
    });
  } catch (error) {
    logger.error(`Failed to send approval notification: ${error.message}`);
  }
}

/**
 * Send rejection notification
 */
async function sendRejectionNotification(organization, notes) {
  try {
    // Send rejection email with reason/feedback
    
    logger.info(`Rejection notification sent`, {
      organizationId: organization.id,
      adminEmail: organization.adminEmail
    });
  } catch (error) {
    logger.error(`Failed to send rejection notification: ${error.message}`);
  }
}