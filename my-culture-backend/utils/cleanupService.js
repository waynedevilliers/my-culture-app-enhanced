import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

const CERTIFICATES_DIR = path.join(process.cwd(), 'public', 'certificates');
const PDFS_DIR = path.join(CERTIFICATES_DIR, 'pdfs');
const IMAGES_DIR = path.join(CERTIFICATES_DIR, 'images');

// Default retention period: 30 days
const DEFAULT_RETENTION_DAYS = parseInt(process.env.CERTIFICATE_RETENTION_DAYS) || 30;

/**
 * Delete files older than specified days
 * @param {string} directory - Directory to clean
 * @param {number} retentionDays - Number of days to keep files
 */
const cleanupDirectory = async (directory, retentionDays = DEFAULT_RETENTION_DAYS) => {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Directory ${directory} does not exist, skipping cleanup`);
      return;
    }

    const files = fs.readdirSync(directory);
    const now = Date.now();
    const maxAge = retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    let deletedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);
      
      try {
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old certificate file: ${file}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing file ${file}:`, error.message);
      }
    }

    console.log(`Cleanup completed for ${directory}: ${deletedCount} files deleted, ${errorCount} errors`);
    return { deletedCount, errorCount };
  } catch (error) {
    console.error(`Error during cleanup of ${directory}:`, error.message);
    return { deletedCount: 0, errorCount: 1 };
  }
};

/**
 * Clean up old certificate files (PDFs and images)
 */
export const cleanupCertificateFiles = async () => {
  console.log('Starting certificate cleanup process...');
  
  const results = {
    pdfs: await cleanupDirectory(PDFS_DIR),
    images: await cleanupDirectory(IMAGES_DIR),
    htmlFiles: await cleanupDirectory(CERTIFICATES_DIR, DEFAULT_RETENTION_DAYS)
  };

  const totalDeleted = results.pdfs.deletedCount + results.images.deletedCount + results.htmlFiles.deletedCount;
  const totalErrors = results.pdfs.errorCount + results.images.errorCount + results.htmlFiles.errorCount;

  console.log(`Certificate cleanup completed: ${totalDeleted} files deleted, ${totalErrors} errors`);
  return results;
};

/**
 * Schedule automatic cleanup to run daily at 2 AM
 */
export const startCleanupScheduler = () => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled certificate cleanup...');
    await cleanupCertificateFiles();
  });

  console.log('Certificate cleanup scheduler started - runs daily at 2:00 AM');
};

/**
 * Manual cleanup function for immediate use
 */
export const runManualCleanup = async (retentionDays = DEFAULT_RETENTION_DAYS) => {
  console.log(`Running manual cleanup with ${retentionDays} days retention...`);
  
  const results = {
    pdfs: await cleanupDirectory(PDFS_DIR, retentionDays),
    images: await cleanupDirectory(IMAGES_DIR, retentionDays),
    htmlFiles: await cleanupDirectory(CERTIFICATES_DIR, retentionDays)
  };

  return results;
};

export default {
  cleanupCertificateFiles,
  startCleanupScheduler,
  runManualCleanup
};