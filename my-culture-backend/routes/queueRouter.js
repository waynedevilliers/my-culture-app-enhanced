import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { 
  queueCertificatePDFGeneration, 
  queueCertificateEmailSending, 
  queueCompleteCertificateProcessing,
  getCertificateJobStatus 
} from '../controllers/queuedCertificateGeneration.js';

const router = Router();

/**
 * @swagger
 * /api/queue/certificate/{id}/pdf:
 *   post:
 *     summary: Queue PDF generation for a certificate
 *     description: Add PDF generation jobs to the queue for all recipients of a certificate
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               priority:
 *                 type: integer
 *                 description: Job priority (higher number = higher priority)
 *                 default: 0
 *     responses:
 *       200:
 *         description: PDF generation jobs queued successfully
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/certificate/:id/pdf', authenticate, authorize(['admin']), queueCertificatePDFGeneration);

/**
 * @swagger
 * /api/queue/certificate/{id}/email:
 *   post:
 *     summary: Queue email sending for a certificate
 *     description: Add email sending jobs to the queue for all recipients of a certificate
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               priority:
 *                 type: integer
 *                 description: Job priority (higher number = higher priority)
 *                 default: 0
 *               delay:
 *                 type: integer
 *                 description: Delay in milliseconds before sending emails
 *                 default: 0
 *     responses:
 *       200:
 *         description: Email sending jobs queued successfully
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/certificate/:id/email', authenticate, authorize(['admin']), queueCertificateEmailSending);

/**
 * @swagger
 * /api/queue/certificate/{id}/complete:
 *   post:
 *     summary: Queue complete certificate processing
 *     description: Queue both PDF generation and email sending for a certificate
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               pdfPriority:
 *                 type: integer
 *                 description: PDF generation priority
 *                 default: 0
 *               emailPriority:
 *                 type: integer
 *                 description: Email sending priority
 *                 default: 0
 *               emailDelay:
 *                 type: integer
 *                 description: Delay in milliseconds before sending emails (allows PDF generation to complete)
 *                 default: 300000
 *     responses:
 *       200:
 *         description: Complete certificate processing queued successfully
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/certificate/:id/complete', authenticate, authorize(['admin']), queueCompleteCertificateProcessing);

/**
 * @swagger
 * /api/queue/certificate/{id}/status:
 *   get:
 *     summary: Get job status for a certificate
 *     description: Get current queue statistics and job status for a certificate
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Job status retrieved successfully
 *       404:
 *         description: Certificate not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/certificate/:id/status', authenticate, authorize(['admin']), getCertificateJobStatus);

/**
 * @swagger
 * /api/queue/stats:
 *   get:
 *     summary: Get overall queue statistics
 *     description: Get current statistics for all queues
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { getQueueStats } = await import("../utils/queueService.js");
    const stats = await getQueueStats();
    
    res.status(200).json({
      message: "Queue statistics retrieved successfully",
      stats: stats
    });
  } catch (error) {
    console.error("Error getting queue stats:", error);
    res.status(500).json({
      message: "Error retrieving queue statistics",
      error: error.message
    });
  }
});

export default router;