import { Router } from 'express';
import { Certificate, CertificateRecipient } from '../db.js';
import { secureCertificateAccess, secureDownloadAccess } from '../middlewares/tokenAuth.js';
import { generateCertificateHTML } from '../controllers/generateCertificatePages.js';
import { generatePDF } from '../utils/pdfGenerator.js';
import asyncWrapper from '../utils/asyncWrapper.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * @swagger
 * /api/certificates/secure/{certificateId}/{recipientId}:
 *   get:
 *     summary: Access secure certificate page
 *     description: View certificate page with token-based access control
 *     tags: [Secure Certificates]
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipient ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Access token
 *     responses:
 *       200:
 *         description: Certificate page HTML
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Token not valid for this certificate
 *       404:
 *         description: Certificate not found
 */
router.get('/secure/:certificateId/:recipientId', secureCertificateAccess, asyncWrapper(async (req, res) => {
  const { certificateId, recipientId } = req.params;
  const token = req.certificateToken;

  try {
    // Get certificate with recipient
    const certificate = await Certificate.findByPk(certificateId, {
      include: [{ 
        model: CertificateRecipient, 
        as: 'recipients',
        where: { id: recipientId }
      }]
    });

    if (!certificate) {
      throw new ErrorResponse('Certificate not found', 404);
    }

    if (!certificate.recipients || certificate.recipients.length === 0) {
      throw new ErrorResponse('Recipient not found', 404);
    }

    const recipient = certificate.recipients[0];

    // Generate secure certificate HTML
    const certificateHtml = await generateCertificateHTML({
      ...certificate.dataValues,
      recipients: [recipient]
    });

    // Log access
    logger.info(`Secure certificate accessed`, {
      certificateId: parseInt(certificateId),
      recipientId: parseInt(recipientId),
      recipientName: recipient.name,
      tokenId: token.jti,
      clientIp: req.ip
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(certificateHtml);
  } catch (error) {
    logger.error(`Error serving secure certificate: ${error.message}`, {
      certificateId,
      recipientId,
      tokenId: token.jti,
      error: error.message
    });

    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error loading certificate',
      error: 'CERTIFICATE_LOAD_ERROR'
    });
  }
}));

/**
 * @swagger
 * /api/certificates/secure/{certificateId}/pdf:
 *   get:
 *     summary: Download secure certificate PDF
 *     description: Download certificate PDF with token-based access control
 *     tags: [Secure Certificates]
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Download token
 *     responses:
 *       200:
 *         description: Certificate PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Token not valid for this certificate
 *       404:
 *         description: Certificate not found
 */
router.get('/secure/:certificateId/pdf', secureDownloadAccess, asyncWrapper(async (req, res) => {
  const { certificateId } = req.params;
  const token = req.certificateToken;

  try {
    // Check if file exists
    const pdfPath = path.join(process.cwd(), 'public', 'certificates', 'pdfs', `${certificateId}.pdf`);
    
    if (fs.existsSync(pdfPath)) {
      // Serve existing PDF
      logger.info(`Serving existing PDF`, {
        certificateId: parseInt(certificateId),
        tokenId: token.jti,
        clientIp: req.ip
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
      res.sendFile(pdfPath);
    } else {
      // Generate PDF on demand
      const certificate = await Certificate.findByPk(certificateId, {
        include: [{ model: CertificateRecipient, as: 'recipients' }]
      });

      if (!certificate) {
        throw new ErrorResponse('Certificate not found', 404);
      }

      // Filter recipient if specified in token
      let recipients = certificate.recipients;
      if (token.recipientId) {
        recipients = recipients.filter(r => r.id === token.recipientId);
      }

      if (recipients.length === 0) {
        throw new ErrorResponse('No valid recipients found', 404);
      }

      // Generate PDF for first recipient (or specific recipient)
      const certificateData = {
        participant: recipients[0].name,
        event: certificate.title,
        issueDate: new Date(certificate.issuedDate).toDateString(),
        signature: certificate.signature || null,
        organizationName: certificate.issuedFrom
      };

      const recipientData = {
        name: recipients[0].name,
        email: recipients[0].email,
        id: recipients[0].id
      };

      const result = await generatePDF(
        certificateData,
        recipientData,
        certificate.templateId || 'elegant-gold'
      );

      logger.info(`Generated PDF on demand`, {
        certificateId: parseInt(certificateId),
        recipientId: recipients[0].id,
        tokenId: token.jti,
        clientIp: req.ip
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
      res.sendFile(result.pdfPath);
    }
  } catch (error) {
    logger.error(`Error serving secure PDF: ${error.message}`, {
      certificateId,
      tokenId: token.jti,
      error: error.message
    });

    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error generating PDF',
      error: 'PDF_GENERATION_ERROR'
    });
  }
}));

/**
 * @swagger
 * /api/certificates/secure/{certificateId}/png:
 *   get:
 *     summary: Download secure certificate PNG
 *     description: Download certificate PNG with token-based access control
 *     tags: [Secure Certificates]
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Download token
 *     responses:
 *       200:
 *         description: Certificate PNG file
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Token not valid for this certificate
 *       404:
 *         description: Certificate not found
 */
router.get('/secure/:certificateId/png', secureDownloadAccess, asyncWrapper(async (req, res) => {
  const { certificateId } = req.params;
  const token = req.certificateToken;

  try {
    // Check if file exists
    const pngPath = path.join(process.cwd(), 'public', 'certificates', 'images', `${certificateId}.png`);
    
    if (fs.existsSync(pngPath)) {
      // Serve existing PNG
      logger.info(`Serving existing PNG`, {
        certificateId: parseInt(certificateId),
        tokenId: token.jti,
        clientIp: req.ip
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.png"`);
      res.sendFile(pngPath);
    } else {
      // Generate PNG on demand (similar to PDF logic)
      const certificate = await Certificate.findByPk(certificateId, {
        include: [{ model: CertificateRecipient, as: 'recipients' }]
      });

      if (!certificate) {
        throw new ErrorResponse('Certificate not found', 404);
      }

      // Filter recipient if specified in token
      let recipients = certificate.recipients;
      if (token.recipientId) {
        recipients = recipients.filter(r => r.id === token.recipientId);
      }

      if (recipients.length === 0) {
        throw new ErrorResponse('No valid recipients found', 404);
      }

      // Generate PNG for first recipient (or specific recipient)
      const certificateData = {
        participant: recipients[0].name,
        event: certificate.title,
        issueDate: new Date(certificate.issuedDate).toDateString(),
        signature: certificate.signature || null,
        organizationName: certificate.issuedFrom
      };

      const recipientData = {
        name: recipients[0].name,
        email: recipients[0].email,
        id: recipients[0].id
      };

      const result = await generatePDF(
        certificateData,
        recipientData,
        certificate.templateId || 'elegant-gold'
      );

      logger.info(`Generated PNG on demand`, {
        certificateId: parseInt(certificateId),
        recipientId: recipients[0].id,
        tokenId: token.jti,
        clientIp: req.ip
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.png"`);
      res.sendFile(result.pngPath);
    }
  } catch (error) {
    logger.error(`Error serving secure PNG: ${error.message}`, {
      certificateId,
      tokenId: token.jti,
      error: error.message
    });

    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error generating PNG',
      error: 'PNG_GENERATION_ERROR'
    });
  }
}));

/**
 * @swagger
 * /api/certificates/secure/token/refresh:
 *   post:
 *     summary: Refresh certificate access token
 *     description: Refresh an expired certificate access token using a refresh token
 *     tags: [Secure Certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/secure/token/refresh', asyncWrapper(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: 'Refresh token required',
      error: 'MISSING_REFRESH_TOKEN'
    });
  }

  try {
    const { refreshCertificateToken } = await import('../utils/tokenService.js');
    const tokens = await refreshCertificateToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    logger.error(`Token refresh failed: ${error.message}`, {
      clientIp: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(401).json({
      message: 'Token refresh failed',
      error: 'REFRESH_FAILED'
    });
  }
}));

export default router;