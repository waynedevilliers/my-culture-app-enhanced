import { Router } from 'express';
import { 
  createSecureCertificateUrl, 
  createSecureDownloadUrl, 
  generateShareToken,
  getTokenConfig,
  validateTokenConfig 
} from '../utils/tokenService.js';
import { Certificate, CertificateRecipient } from '../db.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import asyncWrapper from '../utils/asyncWrapper.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const router = Router();

/**
 * @swagger
 * /api/tokens/certificate/{certificateId}/access:
 *   post:
 *     summary: Generate secure certificate access URL
 *     description: Generate a secure URL with access token for certificate viewing
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: integer
 *                 description: Specific recipient ID (optional)
 *               expiresIn:
 *                 type: string
 *                 description: Token expiration time (e.g., '7d', '1h')
 *                 default: '7d'
 *               purpose:
 *                 type: string
 *                 description: Token purpose
 *                 default: 'certificate_access'
 *     responses:
 *       200:
 *         description: Secure URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 secureUrl:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *                 certificateId:
 *                   type: integer
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/certificate/:certificateId/access', authenticate, authorize, asyncWrapper(async (req, res) => {
  const { certificateId } = req.params;
  const { recipientId, expiresIn = '7d', purpose = 'certificate_access' } = req.body;

  // Verify certificate exists
  const certificate = await Certificate.findByPk(certificateId, {
    include: [{ model: CertificateRecipient, as: 'recipients' }]
  });

  if (!certificate) {
    throw new ErrorResponse('Certificate not found', 404);
  }

  // If recipientId is specified, verify it exists
  if (recipientId) {
    const recipient = certificate.recipients.find(r => r.id === recipientId);
    if (!recipient) {
      throw new ErrorResponse('Recipient not found', 404);
    }
  }

  // Use first recipient if none specified
  const targetRecipientId = recipientId || certificate.recipients[0]?.id;

  if (!targetRecipientId) {
    throw new ErrorResponse('No recipients found for this certificate', 400);
  }

  // Generate secure URL
  const secureUrl = createSecureCertificateUrl(
    parseInt(certificateId),
    targetRecipientId,
    { purpose, expiresIn }
  );

  res.json({
    message: 'Secure certificate URL generated successfully',
    secureUrl,
    expiresIn,
    certificateId: parseInt(certificateId),
    recipientId: targetRecipientId
  });
}));

/**
 * @swagger
 * /api/tokens/certificate/{certificateId}/download:
 *   post:
 *     summary: Generate secure download URL
 *     description: Generate a secure URL with download token for PDF/PNG files
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileType:
 *                 type: string
 *                 enum: [pdf, png]
 *                 description: File type to download
 *                 default: pdf
 *               recipientId:
 *                 type: integer
 *                 description: Specific recipient ID (optional)
 *             required:
 *               - fileType
 *     responses:
 *       200:
 *         description: Secure download URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 downloadUrl:
 *                   type: string
 *                 fileType:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/certificate/:certificateId/download', authenticate, authorize, asyncWrapper(async (req, res) => {
  const { certificateId } = req.params;
  const { fileType = 'pdf', recipientId } = req.body;

  // Validate file type
  if (!['pdf', 'png'].includes(fileType)) {
    throw new ErrorResponse('Invalid file type. Must be pdf or png', 400);
  }

  // Verify certificate exists
  const certificate = await Certificate.findByPk(certificateId, {
    include: [{ model: CertificateRecipient, as: 'recipients' }]
  });

  if (!certificate) {
    throw new ErrorResponse('Certificate not found', 404);
  }

  // If recipientId is specified, verify it exists
  if (recipientId) {
    const recipient = certificate.recipients.find(r => r.id === recipientId);
    if (!recipient) {
      throw new ErrorResponse('Recipient not found', 404);
    }
  }

  // Generate secure download URL
  const downloadUrl = createSecureDownloadUrl(
    parseInt(certificateId),
    fileType,
    { recipientId }
  );

  res.json({
    message: 'Secure download URL generated successfully',
    downloadUrl,
    fileType,
    expiresIn: '1h',
    certificateId: parseInt(certificateId),
    recipientId
  });
}));

/**
 * @swagger
 * /api/tokens/certificate/{certificateId}/share:
 *   post:
 *     summary: Generate share token for social media
 *     description: Generate a long-lived token for social media sharing
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: integer
 *                 description: Specific recipient ID (optional)
 *               platform:
 *                 type: string
 *                 enum: [facebook, twitter, linkedin, general]
 *                 description: Social media platform
 *                 default: general
 *     responses:
 *       200:
 *         description: Share token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shareToken:
 *                   type: string
 *                 shareUrl:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *                 platform:
 *                   type: string
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/certificate/:certificateId/share', authenticate, authorize, asyncWrapper(async (req, res) => {
  const { certificateId } = req.params;
  const { recipientId, platform = 'general' } = req.body;

  // Verify certificate exists
  const certificate = await Certificate.findByPk(certificateId, {
    include: [{ model: CertificateRecipient, as: 'recipients' }]
  });

  if (!certificate) {
    throw new ErrorResponse('Certificate not found', 404);
  }

  // If recipientId is specified, verify it exists
  if (recipientId) {
    const recipient = certificate.recipients.find(r => r.id === recipientId);
    if (!recipient) {
      throw new ErrorResponse('Recipient not found', 404);
    }
  }

  // Use first recipient if none specified
  const targetRecipientId = recipientId || certificate.recipients[0]?.id;

  if (!targetRecipientId) {
    throw new ErrorResponse('No recipients found for this certificate', 400);
  }

  // Generate share token
  const shareToken = generateShareToken({
    certificateId: parseInt(certificateId),
    recipientId: targetRecipientId,
    platform,
    timestamp: Date.now()
  });

  // Create share URL
  const baseUrl = process.env.URL || 'http://localhost:3000';
  const shareUrl = `${baseUrl}/certificates/secure/${certificateId}/${targetRecipientId}?token=${shareToken}`;

  res.json({
    message: 'Share token generated successfully',
    shareToken,
    shareUrl,
    expiresIn: '30d',
    platform,
    certificateId: parseInt(certificateId),
    recipientId: targetRecipientId
  });
}));

/**
 * @swagger
 * /api/tokens/config:
 *   get:
 *     summary: Get token configuration
 *     description: Get current token configuration and settings
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token configuration retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/config', authenticate, authorize, async (req, res) => {
  try {
    const config = getTokenConfig();
    const validation = validateTokenConfig();

    res.json({
      message: 'Token configuration retrieved successfully',
      config,
      validation
    });
  } catch (error) {
    console.error('Error getting token config:', error);
    res.status(500).json({
      message: 'Error retrieving token configuration',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/tokens/validate:
 *   get:
 *     summary: Validate token configuration
 *     description: Validate current token configuration for security issues
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token configuration validated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/validate', authenticate, authorize, async (req, res) => {
  try {
    const validation = validateTokenConfig();

    res.json({
      message: 'Token configuration validated',
      ...validation
    });
  } catch (error) {
    console.error('Error validating token config:', error);
    res.status(500).json({
      message: 'Error validating token configuration',
      error: error.message
    });
  }
});

export default router;