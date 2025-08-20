import { Router } from 'express';
import { runManualCleanup, getCleanupConfig, validateCleanupConfig } from '../utils/cleanupService.js';
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
 *                 description: "Number of days to retain files (default: 30)"
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
router.post('/manual', authenticate, authorize, async (req, res) => {
  try {
    const { retentionDays, dryRun = false, maxFiles } = req.body;
    
    // Validate retention days
    if (retentionDays && (retentionDays < 1 || retentionDays > 365)) {
      return res.status(400).json({
        message: 'Retention days must be between 1 and 365'
      });
    }

    // Validate max files
    if (maxFiles && (maxFiles < 1 || maxFiles > 10000)) {
      return res.status(400).json({
        message: 'Max files must be between 1 and 10000'
      });
    }

    const options = {
      dryRun,
      maxFiles: maxFiles || undefined
    };

    const results = await runManualCleanup(retentionDays, options);
    
    res.json({
      message: `Manual cleanup ${dryRun ? 'simulation' : 'execution'} completed successfully`,
      results,
      retentionDays: retentionDays || 30,
      options
    });
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({
      message: 'Error during cleanup',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/cleanup/config:
 *   get:
 *     summary: Get cleanup configuration
 *     description: Get current cleanup configuration and settings
 *     tags: [Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/config', authenticate, authorize, async (req, res) => {
  try {
    const config = getCleanupConfig();
    const validation = validateCleanupConfig();
    
    res.json({
      message: 'Cleanup configuration retrieved successfully',
      config,
      validation
    });
  } catch (error) {
    console.error('Error getting cleanup config:', error);
    res.status(500).json({
      message: 'Error retrieving cleanup configuration',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/cleanup/validate:
 *   get:
 *     summary: Validate cleanup configuration
 *     description: Validate current cleanup configuration for errors and warnings
 *     tags: [Cleanup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration validated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/validate', authenticate, authorize, async (req, res) => {
  try {
    const validation = validateCleanupConfig();
    
    res.json({
      message: 'Cleanup configuration validated',
      ...validation
    });
  } catch (error) {
    console.error('Error validating cleanup config:', error);
    res.status(500).json({
      message: 'Error validating cleanup configuration',
      error: error.message
    });
  }
});

export default router;