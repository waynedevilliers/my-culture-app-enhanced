import Bull from 'bull';
import { generatePDF } from './pdfGenerator.js';
import { Certificate, CertificateRecipient } from '../db.js';
import logger from './logger.js';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
};

// Create PDF generation queue
export const pdfQueue = new Bull('pdf generation', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10, // Keep only 10 completed jobs
    removeOnFail: 50, // Keep 50 failed jobs for debugging
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 second delay
    },
  },
});

// Create email queue
export const emailQueue = new Bull('email sending', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 second delay for emails
    },
  },
});

// PDF generation job processor
pdfQueue.process('generate-certificate-pdf', async (job) => {
  const { certificateId, templateId, certificateData, recipientData } = job.data;
  
  try {
    logger.info(`Starting PDF generation for certificate ${certificateId}`);
    
    // Update job progress
    job.progress(10);
    
    // Generate PDF and PNG files
    const result = await generatePDF(certificateData, recipientData, templateId);
    
    job.progress(50);
    
    // Update certificate record with file paths
    await Certificate.update({
      certificateUrl: result.pdfPath,
    }, {
      where: { id: certificateId }
    });
    
    job.progress(80);
    
    // Update recipient record with file paths
    await CertificateRecipient.update({
      recipientUrl: result.pngPath,
    }, {
      where: { certificateId, name: recipientData.name }
    });
    
    job.progress(100);
    
    logger.info(`PDF generation completed for certificate ${certificateId}`);
    
    return {
      certificateId,
      pdfPath: result.pdfPath,
      pngPath: result.pngPath,
      success: true
    };
    
  } catch (error) {
    logger.error(`PDF generation failed for certificate ${certificateId}:`, error);
    throw error;
  }
});

// Email sending job processor
emailQueue.process('send-certificate-email', async (job) => {
  const { certificateId, recipientEmail, recipientName, certificateUrl } = job.data;
  
  try {
    logger.info(`Sending certificate email to ${recipientEmail} for certificate ${certificateId}`);
    
    // Import email controller function
    const { sendCertificateEmail } = await import('../controllers/sendCertificateEmail.js');
    
    job.progress(30);
    
    // Send email
    await sendCertificateEmail(recipientEmail, recipientName, certificateUrl);
    
    job.progress(100);
    
    logger.info(`Certificate email sent successfully to ${recipientEmail}`);
    
    return {
      certificateId,
      recipientEmail,
      success: true
    };
    
  } catch (error) {
    logger.error(`Email sending failed for certificate ${certificateId} to ${recipientEmail}:`, error);
    throw error;
  }
});

// Queue event listeners
pdfQueue.on('completed', (job, result) => {
  logger.info(`PDF generation job ${job.id} completed successfully`, result);
});

pdfQueue.on('failed', (job, err) => {
  logger.error(`PDF generation job ${job.id} failed:`, err);
});

emailQueue.on('completed', (job, result) => {
  logger.info(`Email job ${job.id} completed successfully`, result);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

// Helper functions to add jobs to queues
export const addPdfGenerationJob = async (certificateId, templateId, certificateData, recipientData, options = {}) => {
  const job = await pdfQueue.add('generate-certificate-pdf', {
    certificateId,
    templateId,
    certificateData,
    recipientData
  }, {
    priority: options.priority || 0,
    delay: options.delay || 0,
    ...options
  });
  
  logger.info(`PDF generation job ${job.id} added to queue for certificate ${certificateId}`);
  return job;
};

export const addEmailJob = async (certificateId, recipientEmail, recipientName, certificateUrl, options = {}) => {
  const job = await emailQueue.add('send-certificate-email', {
    certificateId,
    recipientEmail,
    recipientName,
    certificateUrl
  }, {
    priority: options.priority || 0,
    delay: options.delay || 0,
    ...options
  });
  
  logger.info(`Email job ${job.id} added to queue for certificate ${certificateId}`);
  return job;
};

// Queue monitoring functions
export const getQueueStats = async () => {
  const pdfStats = {
    waiting: await pdfQueue.getWaiting(),
    active: await pdfQueue.getActive(),
    completed: await pdfQueue.getCompleted(),
    failed: await pdfQueue.getFailed(),
    delayed: await pdfQueue.getDelayed(),
    paused: await pdfQueue.isPaused(),
  };
  
  const emailStats = {
    waiting: await emailQueue.getWaiting(),
    active: await emailQueue.getActive(),
    completed: await emailQueue.getCompleted(),
    failed: await emailQueue.getFailed(),
    delayed: await emailQueue.getDelayed(),
    paused: await emailQueue.isPaused(),
  };
  
  return {
    pdf: {
      ...pdfStats,
      counts: {
        waiting: pdfStats.waiting.length,
        active: pdfStats.active.length,
        completed: pdfStats.completed.length,
        failed: pdfStats.failed.length,
        delayed: pdfStats.delayed.length,
      }
    },
    email: {
      ...emailStats,
      counts: {
        waiting: emailStats.waiting.length,
        active: emailStats.active.length,
        completed: emailStats.completed.length,
        failed: emailStats.failed.length,
        delayed: emailStats.delayed.length,
      }
    }
  };
};

// Cleanup functions
export const cleanupQueues = async () => {
  await pdfQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
  await pdfQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 24 hours
  await emailQueue.clean(24 * 60 * 60 * 1000, 'completed');
  await emailQueue.clean(24 * 60 * 60 * 1000, 'failed');
  
  logger.info('Queue cleanup completed');
};

// Graceful shutdown
export const closeQueues = async () => {
  await pdfQueue.close();
  await emailQueue.close();
  logger.info('Queues closed successfully');
};

export default {
  pdfQueue,
  emailQueue,
  addPdfGenerationJob,
  addEmailJob,
  getQueueStats,
  cleanupQueues,
  closeQueues
};