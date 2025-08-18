import express from 'express';
import {
  submitApplication,
  getPendingApplications,
  processApplication,
  getApplicationStatus
} from '../controllers/organizationApproval.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for application submissions
const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 applications per IP per 15 minutes
  message: {
    error: 'Too many applications submitted. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for status checks
const statusLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 status checks per IP per 5 minutes
  message: {
    error: 'Too many status requests. Please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/organizations/apply:
 *   post:
 *     summary: Submit organization application
 *     description: Submit a new organization application for approval
 *     tags: [Organization Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - adminName
 *               - adminEmail
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Organization name
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 5000
 *                 description: Organization description
 *               website:
 *                 type: string
 *                 format: url
 *                 description: Organization website (optional)
 *               phone:
 *                 type: string
 *                 pattern: '^\+(?:[0-9] ?){6,14}[0-9]$'
 *                 description: Organization phone number (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Organization contact email (optional)
 *               contactPerson:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Main contact person (optional)
 *               adminName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Administrator name
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 description: Administrator email address
 *               logo:
 *                 type: string
 *                 format: url
 *                 description: Organization logo URL (optional)
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 organizationId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   enum: [pending]
 *                 nextSteps:
 *                   type: string
 *       400:
 *         description: Validation error or duplicate data
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/apply', applicationLimiter, submitApplication);

/**
 * @swagger
 * /api/organizations/{id}/status:
 *   get:
 *     summary: Get application status
 *     description: Check the status of an organization application
 *     tags: [Organization Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Application status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 organizationId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected]
 *                 submittedAt:
 *                   type: string
 *                   format: date-time
 *                 processedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Organization not found
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/:id/status', statusLimiter, getApplicationStatus);

// Admin-only routes (require authentication and superAdmin role)

/**
 * @swagger
 * /api/admin/organizations/pending:
 *   get:
 *     summary: Get pending applications (Admin only)
 *     description: Retrieve all pending organization applications for review
 *     tags: [Admin - Organization Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       website:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       contactPerson:
 *                         type: string
 *                       adminName:
 *                         type: string
 *                       adminEmail:
 *                         type: string
 *                       logo:
 *                         type: string
 *                       approvalStatus:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/admin/pending', 
  authenticateToken, 
  requireRole(['superAdmin']), 
  getPendingApplications
);

/**
 * @swagger
 * /api/admin/organizations/process:
 *   post:
 *     summary: Process organization application (Admin only)
 *     description: Approve or reject a pending organization application
 *     tags: [Admin - Organization Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - decision
 *             properties:
 *               organizationId:
 *                 type: integer
 *                 description: Organization ID to process
 *               decision:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Approval decision
 *               adminPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: Admin password (required for approved applications)
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Additional notes (optional)
 *     responses:
 *       200:
 *         description: Application processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 organizationId:
 *                   type: integer
 *                 adminUserId:
 *                   type: integer
 *                   description: Created admin user ID (for approved applications)
 *                 status:
 *                   type: string
 *                   enum: [approved, rejected]
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Pending application not found
 */
router.post('/admin/process', 
  authenticateToken, 
  requireRole(['superAdmin']), 
  processApplication
);

export default router;