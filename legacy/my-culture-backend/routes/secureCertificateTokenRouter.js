import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Certificate, CertificateRecipient, Organization } from '../db.js';
import { parseSecureFilePath, validateSecureAccessUrl, generateSecureAccessUrl } from '../utils/secureFileUtils.js';
import { z } from 'zod';
import asyncWrapper from '../utils/asyncWrapper.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validation schemas
const secureAccessSchema = z.object({
  organizationId: z.number().int().positive(),
  certificateId: z.number().int().positive(),
  secureToken: z.string().regex(/^[a-f0-9]{24}$/),
  fileExtension: z.enum(['pdf', 'png', 'html'])
});

const urlExpirationSchema = z.object({
  expires: z.string().optional()
});

/**
 * Middleware to validate secure file access
 */
const validateSecureAccess = asyncWrapper(async (req, res, next) => {
  try {
    const { organizationId, certificateId, secureToken } = req.params;
    const { expires } = urlExpirationSchema.parse(req.query);
    
    // Validate path parameters
    const pathParams = secureAccessSchema.omit({ fileExtension: true }).parse({
      organizationId: parseInt(organizationId),
      certificateId: parseInt(certificateId),
      secureToken
    });
    
    // Check URL expiration if provided
    if (expires) {
      const expirationTime = parseInt(expires);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime > expirationTime) {
        throw new ErrorResponse('Access URL has expired', 401);
      }
    }
    
    // Verify certificate exists and belongs to organization
    const certificate = await Certificate.findOne({
      where: {
        id: pathParams.certificateId
      },
      include: [{
        model: CertificateRecipient,
        as: 'recipients'
      }]
    });
    
    if (!certificate) {
      throw new ErrorResponse('Certificate not found', 404);
    }
    
    // Add validated data to request
    req.secureAccess = {
      ...pathParams,
      certificate,
      expires
    };
    
    next();
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }
    
    logger.error(`Secure access validation failed: ${error.message}`, {
      organizationId: req.params.organizationId,
      certificateId: req.params.certificateId,
      clientIp: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(400).json({
      error: 'Invalid access parameters'
    });
  }
});

/**
 * Serve secure certificate files using crypto tokens
 * GET /api/certificates/secure/:organizationId/:certificateId/:secureToken.pdf
 * GET /api/certificates/secure/:organizationId/:certificateId/:secureToken.png
 * GET /api/certificates/secure/:organizationId/:certificateId/:secureToken.html
 */
router.get('/secure/:organizationId/:certificateId/:secureToken.:fileExtension', validateSecureAccess, asyncWrapper(async (req, res) => {
  try {
    const { fileExtension } = req.params;
    const { certificate, organizationId, certificateId, secureToken } = req.secureAccess;
    
    // Validate file extension
    const validatedAccess = secureAccessSchema.parse({
      organizationId,
      certificateId,
      secureToken,
      fileExtension
    });
    
    // Construct the expected secure file path
    const expectedPath = `org${organizationId}/certificate-cert${certificateId}-${secureToken}.${fileExtension}`;
    
    // Try to find the actual file with secure path
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    const possiblePaths = [];
    
    // Search for files matching the pattern in organization folders
    try {
      const orgFolders = await fs.readdir(certificatesDir);
      for (const folder of orgFolders) {
        if (folder.includes(`-org${organizationId}`)) {
          const folderPath = path.join(certificatesDir, folder);
          const stats = await fs.stat(folderPath);
          if (stats.isDirectory()) {
            const files = await fs.readdir(folderPath);
            for (const file of files) {
              if (file.includes(`cert${certificateId}-${secureToken}.${fileExtension}`)) {
                possiblePaths.push(path.join(folderPath, file));
              }
            }
          }
        }
      }
    } catch (searchError) {
      logger.warn(`Error searching for secure file: ${searchError.message}`);
    }
    
    let filePath = null;
    if (possiblePaths.length > 0) {
      filePath = possiblePaths[0]; // Use first match
    }
    
    if (!filePath || !(await fs.access(filePath).then(() => true).catch(() => false))) {
      // File doesn't exist, generate on demand if possible
      if (fileExtension === 'pdf' || fileExtension === 'png') {
        return await generateAndServeFile(req, res, certificate, fileExtension);
      } else {
        throw new ErrorResponse('Certificate file not found', 404);
      }
    }
    
    // Log secure access
    logger.info(`Secure certificate file accessed`, {
      organizationId,
      certificateId,
      fileExtension,
      secureToken,
      filePath: path.basename(filePath),
      clientIp: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Set appropriate headers
    const mimeTypes = {
      pdf: 'application/pdf',
      png: 'image/png',
      html: 'text/html'
    };
    
    const fileName = `certificate-${certificateId}.${fileExtension}`;
    
    res.setHeader('Content-Type', mimeTypes[fileExtension]);
    if (fileExtension !== 'html') {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // Prevent indexing
    
    // Stream the file
    res.sendFile(filePath);
    
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }
    
    logger.error(`Error serving secure certificate file: ${error.message}`, {
      organizationId: req.params.organizationId,
      certificateId: req.params.certificateId,
      fileExtension: req.params.fileExtension,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to serve certificate file'
    });
  }
}));

/**
 * Generate and serve certificate file on demand
 */
async function generateAndServeFile(req, res, certificate, fileExtension) {
  const { generateCertificatePDF, generateCertificatePNG } = await import('../utils/pdfGenerator.js');
  const { generateCertificateHTML } = await import('../controllers/generateCertificatePages.js');
  
  try {
    // Get organization info
    const organization = await Organization.findByPk(req.secureAccess.organizationId);
    if (!organization) {
      throw new ErrorResponse('Organization not found', 404);
    }
    
    // Use first recipient for generation
    const recipient = certificate.recipients[0];
    if (!recipient) {
      throw new ErrorResponse('No recipients found for certificate', 404);
    }
    
    // Generate HTML content
    const htmlContent = await generateCertificateHTML({
      ...certificate.dataValues,
      recipients: [recipient]
    });
    
    // Prepare generation parameters
    const genParams = {
      htmlContent,
      certificateId: certificate.id,
      recipientId: recipient.id,
      recipientName: recipient.name,
      certificateTitle: certificate.title,
      organizationId: organization.id,
      organizationName: organization.name
    };
    
    let result;
    let mimeType;
    let fileName;
    
    if (fileExtension === 'pdf') {
      result = await generateCertificatePDF(genParams);
      mimeType = 'application/pdf';
      fileName = `certificate-${certificate.id}.pdf`;
    } else if (fileExtension === 'png') {
      result = await generateCertificatePNG(genParams);
      mimeType = 'image/png';
      fileName = `certificate-${certificate.id}.png`;
    } else {
      throw new ErrorResponse('Unsupported file type for generation', 400);
    }
    
    logger.info(`Generated secure certificate file on demand`, {
      organizationId: organization.id,
      certificateId: certificate.id,
      recipientId: recipient.id,
      fileExtension,
      secureFileName: result.fileName,
      clientIp: req.ip
    });
    
    // Set headers and serve file
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    
    res.sendFile(result.fullPath);
    
  } catch (error) {
    logger.error(`Error generating certificate file on demand: ${error.message}`, {
      certificateId: certificate.id,
      fileExtension,
      error: error.message
    });
    
    throw new ErrorResponse('Failed to generate certificate file', 500);
  }
}

/**
 * Generate secure access URLs for a certificate
 * POST /api/certificates/:id/secure-urls
 */
router.post('/:id/secure-urls', asyncWrapper(async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresIn = 3600 } = req.body; // Default: 1 hour
    
    // Get certificate with organization and recipients
    const certificate = await Certificate.findByPk(id, {
      include: [
        { model: CertificateRecipient, as: 'recipients' },
        { model: Organization, as: 'organization' }
      ]
    });
    
    if (!certificate) {
      throw new ErrorResponse('Certificate not found', 404);
    }
    
    // Generate secure URLs for each recipient
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const secureUrls = [];
    
    for (const recipient of certificate.recipients) {
      // This would require the actual secure file paths to be stored in the database
      // For now, we'll generate example URLs based on the expected pattern
      const orgSlug = certificate.organization.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const recipientSlug = recipient.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const certSlug = certificate.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Generate secure token (this should come from actual file generation)
      const { generateSecureToken } = await import('../utils/secureFileUtils.js');
      const secureToken = generateSecureToken(12);
      
      const urls = {
        recipientId: recipient.id,
        recipientName: recipient.name,
        pdfUrl: generateSecureAccessUrl(baseUrl, 
          `${orgSlug}-org${certificate.organizationId}/certificate-${recipientSlug}-${certSlug}-cert${id}-${secureToken}.pdf`,
          { expiresIn }
        ),
        pngUrl: generateSecureAccessUrl(baseUrl,
          `${orgSlug}-org${certificate.organizationId}/certificate-${recipientSlug}-${certSlug}-cert${id}-${secureToken}.png`,
          { expiresIn }
        )
      };
      
      secureUrls.push(urls);
    }
    
    res.json({
      success: true,
      certificateId: id,
      certificateTitle: certificate.title,
      organizationId: certificate.organizationId,
      organizationName: certificate.organization.name,
      expiresIn,
      secureUrls
    });
    
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }
    
    logger.error(`Error generating secure URLs: ${error.message}`, {
      certificateId: req.params.id,
      error: error.message
    });
    
    res.status(500).json({
      error: 'Failed to generate secure URLs'
    });
  }
}));

export default router;