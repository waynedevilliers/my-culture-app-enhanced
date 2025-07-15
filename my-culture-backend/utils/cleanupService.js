import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { cleanupQueues } from './queueService.js';
import logger from './logger.js';

const CERTIFICATES_DIR = path.join(process.cwd(), 'public', 'certificates');
const PDFS_DIR = path.join(CERTIFICATES_DIR, 'pdfs');
const IMAGES_DIR = path.join(CERTIFICATES_DIR, 'images');

// Configuration with environment variables
const CONFIG = {
  // File retention periods (in days)
  CERTIFICATE_RETENTION_DAYS: parseInt(process.env.CERTIFICATE_RETENTION_DAYS) || 30,
  PDF_RETENTION_DAYS: parseInt(process.env.PDF_RETENTION_DAYS) || 30,
  IMAGE_RETENTION_DAYS: parseInt(process.env.IMAGE_RETENTION_DAYS) || 30,
  HTML_RETENTION_DAYS: parseInt(process.env.HTML_RETENTION_DAYS) || 30,
  
  // Queue cleanup settings
  QUEUE_CLEANUP_ENABLED: process.env.QUEUE_CLEANUP_ENABLED !== 'false',
  COMPLETED_JOBS_RETENTION_HOURS: parseInt(process.env.COMPLETED_JOBS_RETENTION_HOURS) || 24,
  FAILED_JOBS_RETENTION_HOURS: parseInt(process.env.FAILED_JOBS_RETENTION_HOURS) || 72,
  
  // Schedule settings
  CLEANUP_SCHEDULE: process.env.CLEANUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
  QUEUE_CLEANUP_SCHEDULE: process.env.QUEUE_CLEANUP_SCHEDULE || '0 1 * * *', // Daily at 1 AM
  
  // Safety settings
  MAX_FILES_PER_CLEANUP: parseInt(process.env.MAX_FILES_PER_CLEANUP) || 1000,
  DRY_RUN: process.env.CLEANUP_DRY_RUN === 'true',
  
  // Logging
  LOG_LEVEL: process.env.CLEANUP_LOG_LEVEL || 'info'
};

// Default retention period
const DEFAULT_RETENTION_DAYS = CONFIG.CERTIFICATE_RETENTION_DAYS;

/**
 * Delete files older than specified days
 * @param {string} directory - Directory to clean
 * @param {number} retentionDays - Number of days to keep files
 * @param {Object} options - Additional options
 * @returns {Object} - Cleanup results
 */
const cleanupDirectory = async (directory, retentionDays = DEFAULT_RETENTION_DAYS, options = {}) => {
  const { dryRun = CONFIG.DRY_RUN, maxFiles = CONFIG.MAX_FILES_PER_CLEANUP } = options;
  
  try {
    if (!fs.existsSync(directory)) {
      logger.info(`Directory ${directory} does not exist, skipping cleanup`);
      return { deletedCount: 0, errorCount: 0, skippedCount: 0 };
    }

    const files = fs.readdirSync(directory);
    const now = Date.now();
    const maxAge = retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    let deletedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let processedCount = 0;

    logger.info(`Starting cleanup of ${directory} with ${retentionDays} days retention (${files.length} files to check)`);

    for (const file of files) {
      if (processedCount >= maxFiles) {
        logger.warn(`Reached maximum files limit (${maxFiles}), stopping cleanup`);
        break;
      }

      const filePath = path.join(directory, file);
      
      try {
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();
        const daysSinceModified = Math.floor(fileAge / (24 * 60 * 60 * 1000));
        
        if (fileAge > maxAge) {
          if (dryRun) {
            logger.info(`[DRY RUN] Would delete: ${file} (${daysSinceModified} days old)`);
            deletedCount++;
          } else {
            fs.unlinkSync(filePath);
            deletedCount++;
            logger.debug(`Deleted old certificate file: ${file} (${daysSinceModified} days old)`);
          }
        } else {
          skippedCount++;
          logger.debug(`Keeping file: ${file} (${daysSinceModified} days old)`);
        }
        
        processedCount++;
      } catch (error) {
        errorCount++;
        logger.error(`Error processing file ${file}:`, error.message);
      }
    }

    const action = dryRun ? 'would delete' : 'deleted';
    logger.info(`Cleanup completed for ${directory}: ${deletedCount} files ${action}, ${skippedCount} files kept, ${errorCount} errors`);
    
    return { 
      deletedCount, 
      errorCount, 
      skippedCount, 
      processedCount,
      totalFiles: files.length,
      retentionDays,
      directory: path.basename(directory),
      dryRun
    };
  } catch (error) {
    logger.error(`Error during cleanup of ${directory}:`, error.message);
    return { 
      deletedCount: 0, 
      errorCount: 1, 
      skippedCount: 0, 
      processedCount: 0,
      totalFiles: 0,
      retentionDays,
      directory: path.basename(directory),
      dryRun,
      error: error.message
    };
  }
};

/**
 * Clean up old certificate files (PDFs, images, and HTML files)
 * @param {Object} options - Cleanup options
 * @returns {Object} - Cleanup results
 */
export const cleanupCertificateFiles = async (options = {}) => {
  const startTime = Date.now();
  logger.info('Starting certificate cleanup process...');
  
  const results = {
    pdfs: await cleanupDirectory(PDFS_DIR, CONFIG.PDF_RETENTION_DAYS, options),
    images: await cleanupDirectory(IMAGES_DIR, CONFIG.IMAGE_RETENTION_DAYS, options),
    htmlFiles: await cleanupDirectory(CERTIFICATES_DIR, CONFIG.HTML_RETENTION_DAYS, options)
  };

  // Calculate totals
  const totalDeleted = results.pdfs.deletedCount + results.images.deletedCount + results.htmlFiles.deletedCount;
  const totalErrors = results.pdfs.errorCount + results.images.errorCount + results.htmlFiles.errorCount;
  const totalSkipped = results.pdfs.skippedCount + results.images.skippedCount + results.htmlFiles.skippedCount;
  const totalProcessed = results.pdfs.processedCount + results.images.processedCount + results.htmlFiles.processedCount;

  const duration = Date.now() - startTime;
  const action = options.dryRun ? 'would delete' : 'deleted';
  
  logger.info(`Certificate cleanup completed in ${duration}ms: ${totalDeleted} files ${action}, ${totalSkipped} files kept, ${totalErrors} errors`);
  
  return {
    ...results,
    summary: {
      totalDeleted,
      totalErrors,
      totalSkipped,
      totalProcessed,
      duration,
      dryRun: options.dryRun || CONFIG.DRY_RUN,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Schedule automatic cleanup processes
 */
export const startCleanupScheduler = () => {
  // Schedule certificate file cleanup
  cron.schedule(CONFIG.CLEANUP_SCHEDULE, async () => {
    logger.info('Running scheduled certificate cleanup...');
    try {
      await cleanupCertificateFiles();
    } catch (error) {
      logger.error('Scheduled certificate cleanup failed:', error);
    }
  });

  // Schedule queue cleanup (if enabled)
  if (CONFIG.QUEUE_CLEANUP_ENABLED) {
    cron.schedule(CONFIG.QUEUE_CLEANUP_SCHEDULE, async () => {
      logger.info('Running scheduled queue cleanup...');
      try {
        await cleanupQueues();
      } catch (error) {
        logger.error('Scheduled queue cleanup failed:', error);
      }
    });
    
    logger.info(`Queue cleanup scheduler started - runs at ${CONFIG.QUEUE_CLEANUP_SCHEDULE}`);
  }

  logger.info(`Certificate cleanup scheduler started - runs at ${CONFIG.CLEANUP_SCHEDULE}`);
};

/**
 * Manual cleanup function for immediate use
 * @param {number} retentionDays - Days to retain files
 * @param {Object} options - Additional options
 * @returns {Object} - Cleanup results
 */
export const runManualCleanup = async (retentionDays = DEFAULT_RETENTION_DAYS, options = {}) => {
  logger.info(`Running manual cleanup with ${retentionDays} days retention...`);
  
  const results = {
    pdfs: await cleanupDirectory(PDFS_DIR, retentionDays, options),
    images: await cleanupDirectory(IMAGES_DIR, retentionDays, options),
    htmlFiles: await cleanupDirectory(CERTIFICATES_DIR, retentionDays, options)
  };

  // Calculate totals
  const totalDeleted = results.pdfs.deletedCount + results.images.deletedCount + results.htmlFiles.deletedCount;
  const totalErrors = results.pdfs.errorCount + results.images.errorCount + results.htmlFiles.errorCount;
  const totalSkipped = results.pdfs.skippedCount + results.images.skippedCount + results.htmlFiles.skippedCount;

  const action = options.dryRun ? 'would delete' : 'deleted';
  logger.info(`Manual cleanup completed: ${totalDeleted} files ${action}, ${totalSkipped} files kept, ${totalErrors} errors`);

  return {
    ...results,
    summary: {
      totalDeleted,
      totalErrors,
      totalSkipped,
      retentionDays,
      dryRun: options.dryRun || CONFIG.DRY_RUN,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Get cleanup configuration
 * @returns {Object} - Current cleanup configuration
 */
export const getCleanupConfig = () => {
  return {
    ...CONFIG,
    directories: {
      certificates: CERTIFICATES_DIR,
      pdfs: PDFS_DIR,
      images: IMAGES_DIR
    }
  };
};

/**
 * Validate cleanup configuration
 * @returns {Object} - Validation results
 */
export const validateCleanupConfig = () => {
  const errors = [];
  const warnings = [];

  // Check retention periods
  if (CONFIG.CERTIFICATE_RETENTION_DAYS < 1) {
    errors.push('Certificate retention days must be at least 1');
  }
  if (CONFIG.CERTIFICATE_RETENTION_DAYS > 365) {
    warnings.push('Certificate retention period is longer than 1 year');
  }

  // Check directories
  if (!fs.existsSync(CERTIFICATES_DIR)) {
    warnings.push(`Certificates directory does not exist: ${CERTIFICATES_DIR}`);
  }

  // Check schedule format
  if (!cron.validate(CONFIG.CLEANUP_SCHEDULE)) {
    errors.push(`Invalid cleanup schedule format: ${CONFIG.CLEANUP_SCHEDULE}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config: CONFIG
  };
};

export default {
  cleanupCertificateFiles,
  startCleanupScheduler,
  runManualCleanup,
  getCleanupConfig,
  validateCleanupConfig
};