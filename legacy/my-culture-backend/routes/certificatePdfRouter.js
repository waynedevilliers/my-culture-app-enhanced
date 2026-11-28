import express from 'express';
import { generateCertificatePDF, generateCertificatePNG } from '../utils/pdfGenerator.js';
import { generateCertificateHTML } from '../controllers/generateCertificatePages.js';
import { Certificate, CertificateRecipient } from '../db.js';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

/**
 * Generate and download PDF for a specific certificate
 * GET /api/certificates/:id/pdf
 * GET /api/certificates/:id/pdf/:recipientId (for specific recipient)
 */
router.get('/:id/pdf/:recipientId?', async (req, res) => {
  try {
    const { id, recipientId } = req.params;
    
    // Find the certificate with recipients
    const certificate = await Certificate.findByPk(id, {
      include: [{ model: CertificateRecipient, as: "recipients" }]
    });
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // If recipientId is provided, filter to that specific recipient
    if (recipientId) {
      const specificRecipient = certificate.recipients.find(r => r.id == recipientId);
      if (!specificRecipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
      certificate.recipients = [specificRecipient];
    }

    // Generate HTML content for the certificate
    const htmlContent = await generateCertificateHTML(certificate);
    
    // Generate PDF using Puppeteer
    const pdfPath = await generateCertificatePDF(id, htmlContent);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the PDF file
    const pdfBuffer = await fs.readFile(pdfPath);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message 
    });
  }
});

/**
 * Generate and download high-quality PNG for a specific certificate
 * GET /api/certificates/:id/png
 * GET /api/certificates/:id/png/:recipientId (for specific recipient)
 */
router.get('/:id/png/:recipientId?', async (req, res) => {
  try {
    const { id, recipientId } = req.params;
    
    // Find the certificate with recipients
    const certificate = await Certificate.findByPk(id, {
      include: [{ model: CertificateRecipient, as: "recipients" }]
    });
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // If recipientId is provided, filter to that specific recipient
    if (recipientId) {
      const specificRecipient = certificate.recipients.find(r => r.id == recipientId);
      if (!specificRecipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
      certificate.recipients = [specificRecipient];
    }

    // Generate HTML content for the certificate
    const htmlContent = await generateCertificateHTML(certificate);
    
    // Generate PNG using Puppeteer
    const imagePath = await generateCertificatePNG(id, htmlContent);
    
    // Set response headers for PNG download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}.png"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the PNG file
    const imageBuffer = await fs.readFile(imagePath);
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error generating PNG:', error);
    res.status(500).json({ 
      error: 'Failed to generate PNG',
      message: error.message 
    });
  }
});

/**
 * Generate PDF and return download URL
 * POST /api/certificates/:id/generate-pdf
 */
router.post('/:id/generate-pdf', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the certificate with recipients
    const certificate = await Certificate.findByPk(id, {
      include: [{ model: CertificateRecipient, as: "recipients" }]
    });
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Generate HTML content for the certificate
    const htmlContent = await generateCertificateHTML(certificate);
    
    // Generate PDF using Puppeteer
    const pdfPath = await generateCertificatePDF(id, htmlContent);
    
    // Return download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/certificates/${id}/pdf`;
    
    res.json({
      success: true,
      message: 'PDF generated successfully',
      downloadUrl,
      pdfPath: path.basename(pdfPath)
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message 
    });
  }
});

/**
 * Generate PNG and return download URL
 * POST /api/certificates/:id/generate-png
 */
router.post('/:id/generate-png', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the certificate with recipients
    const certificate = await Certificate.findByPk(id, {
      include: [{ model: CertificateRecipient, as: "recipients" }]
    });
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Generate HTML content for the certificate
    const htmlContent = await generateCertificateHTML(certificate);
    
    // Generate PNG using Puppeteer
    const imagePath = await generateCertificatePNG(id, htmlContent);
    
    // Return download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/certificates/${id}/png`;
    
    res.json({
      success: true,
      message: 'PNG generated successfully',
      downloadUrl,
      imagePath: path.basename(imagePath)
    });
    
  } catch (error) {
    console.error('Error generating PNG:', error);
    res.status(500).json({ 
      error: 'Failed to generate PNG',
      message: error.message 
    });
  }
});

export default router;