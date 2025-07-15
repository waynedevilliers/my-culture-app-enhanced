import { Router } from 'express';
import { runManualCleanup } from '../utils/cleanupService.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

/**
 * @swagger
 * /api/cleanup/manual:
 *   post:
 *     summary: Run manual cleanup of old certificate files
 *     description: Manually trigger cleanup of certificate files older than specified days (admin only)
 *     tags: [Cleanup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               retentionDays:
 *                 type: integer
 *                 description: Number of days to retain files (default: 30)
 *                 minimum: 1
 *                 maximum: 365
 *                 example: 30
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Manual cleanup completed successfully"
 *                 results:
 *                   type: object
 *                   properties:
 *                     pdfs:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: integer
 *                         errorCount:
 *                           type: integer
 *                     images:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: integer
 *                         errorCount:
 *                           type: integer
 *                     htmlFiles:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: integer
 *                         errorCount:
 *                           type: integer
 *                 retentionDays:
 *                   type: integer
 *       400:
 *         description: Invalid retention days parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/manual', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { retentionDays } = req.body;
    
    // Validate retention days
    if (retentionDays && (retentionDays < 1 || retentionDays > 365)) {
      return res.status(400).json({
        message: 'Retention days must be between 1 and 365'
      });
    }

    const results = await runManualCleanup(retentionDays);
    
    res.json({
      message: 'Manual cleanup completed successfully',
      results,
      retentionDays: retentionDays || 30
    });
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({
      message: 'Error during cleanup',
      error: error.message
    });
  }
});

export default router;