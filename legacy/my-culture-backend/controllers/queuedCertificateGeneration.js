import { Certificate, CertificateRecipient } from "../db.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { addPdfGenerationJob, addEmailJob } from "../utils/queueService.js";
import { getTemplateById } from "../utils/certificateTemplates.js";

/**
 * Queue PDF generation for a certificate and all its recipients
 */
export const queueCertificatePDFGeneration = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { priority = 0 } = req.body;

  const certificate = await Certificate.findByPk(id, {
    include: [{ model: CertificateRecipient, as: "recipients" }],
  });

  if (!certificate) throw new ErrorResponse("Certificate not found", 404);
  if (!certificate.recipients || certificate.recipients.length === 0) {
    throw new ErrorResponse("No recipients found for this certificate", 400);
  }

  const templateId = certificate.templateId || 'elegant-gold';
  const template = getTemplateById(templateId);
  
  if (!template) {
    throw new ErrorResponse("Invalid template ID", 400);
  }

  // Prepare base certificate data
  const baseCertificateData = {
    event: certificate.title,
    issueDate: new Date(certificate.issuedDate).toDateString(),
    signature: certificate.signature || null,
    organizationName: certificate.issuedFrom,
    description: certificate.description
  };

  const jobs = [];

  // Queue PDF generation for each recipient
  for (const recipient of certificate.recipients) {
    const recipientData = {
      name: recipient.name,
      email: recipient.email,
      id: recipient.id
    };

    const certificateData = {
      ...baseCertificateData,
      participant: recipient.name
    };

    try {
      const job = await addPdfGenerationJob(
        certificate.id,
        templateId,
        certificateData,
        recipientData,
        { priority }
      );

      jobs.push({
        jobId: job.id,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: 'queued'
      });
    } catch (error) {
      console.error(`Failed to queue PDF generation for ${recipient.name}:`, error);
      jobs.push({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: 'failed',
        error: error.message
      });
    }
  }

  res.status(200).json({
    message: `PDF generation queued for ${jobs.length} recipients`,
    certificateId: certificate.id,
    jobs: jobs
  });
});

/**
 * Queue email sending for a certificate
 */
export const queueCertificateEmailSending = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { priority = 0, delay = 0 } = req.body;

  const certificate = await Certificate.findByPk(id, {
    include: [{ model: CertificateRecipient, as: "recipients" }],
  });

  if (!certificate) throw new ErrorResponse("Certificate not found", 404);
  if (!certificate.recipients || certificate.recipients.length === 0) {
    throw new ErrorResponse("No recipients found for this certificate", 400);
  }

  const baseUrl = process.env.URL || "http://localhost:3000";
  const jobs = [];

  // Queue email sending for each recipient
  for (const recipient of certificate.recipients) {
    if (!recipient.recipientUrl) {
      jobs.push({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: 'skipped',
        error: 'No certificate URL found - generate certificate first'
      });
      continue;
    }

    try {
      const job = await addEmailJob(
        certificate.id,
        recipient.email,
        recipient.name,
        recipient.recipientUrl,
        { priority, delay }
      );

      jobs.push({
        jobId: job.id,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: 'queued'
      });
    } catch (error) {
      console.error(`Failed to queue email for ${recipient.name}:`, error);
      jobs.push({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: 'failed',
        error: error.message
      });
    }
  }

  res.status(200).json({
    message: `Email sending queued for ${jobs.filter(j => j.status === 'queued').length} recipients`,
    certificateId: certificate.id,
    jobs: jobs
  });
});

/**
 * Queue complete certificate processing (PDFs + Emails)
 */
export const queueCompleteCertificateProcessing = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { pdfPriority = 0, emailPriority = 0, emailDelay = 300000 } = req.body; // 5 min delay for emails

  const certificate = await Certificate.findByPk(id, {
    include: [{ model: CertificateRecipient, as: "recipients" }],
  });

  if (!certificate) throw new ErrorResponse("Certificate not found", 404);
  if (!certificate.recipients || certificate.recipients.length === 0) {
    throw new ErrorResponse("No recipients found for this certificate", 400);
  }

  const templateId = certificate.templateId || 'elegant-gold';
  const template = getTemplateById(templateId);
  
  if (!template) {
    throw new ErrorResponse("Invalid template ID", 400);
  }

  // Prepare base certificate data
  const baseCertificateData = {
    event: certificate.title,
    issueDate: new Date(certificate.issuedDate).toDateString(),
    signature: certificate.signature || null,
    organizationName: certificate.issuedFrom,
    description: certificate.description
  };

  const pdfJobs = [];
  const emailJobs = [];

  // Queue PDF generation and email sending for each recipient
  for (const recipient of certificate.recipients) {
    const recipientData = {
      name: recipient.name,
      email: recipient.email,
      id: recipient.id
    };

    const certificateData = {
      ...baseCertificateData,
      participant: recipient.name
    };

    // Queue PDF generation
    try {
      const pdfJob = await addPdfGenerationJob(
        certificate.id,
        templateId,
        certificateData,
        recipientData,
        { priority: pdfPriority }
      );

      pdfJobs.push({
        jobId: pdfJob.id,
        recipientName: recipient.name,
        status: 'queued'
      });
    } catch (error) {
      console.error(`Failed to queue PDF generation for ${recipient.name}:`, error);
      pdfJobs.push({
        recipientName: recipient.name,
        status: 'failed',
        error: error.message
      });
    }

    // Queue email sending (with delay to allow PDF generation to complete)
    try {
      const certificateUrl = `${process.env.URL || "http://localhost:3000"}/certificates/${certificate.id}-${recipient.id}.html`;
      
      const emailJob = await addEmailJob(
        certificate.id,
        recipient.email,
        recipient.name,
        certificateUrl,
        { priority: emailPriority, delay: emailDelay }
      );

      emailJobs.push({
        jobId: emailJob.id,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: 'queued'
      });
    } catch (error) {
      console.error(`Failed to queue email for ${recipient.name}:`, error);
      emailJobs.push({
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        status: 'failed',
        error: error.message
      });
    }
  }

  res.status(200).json({
    message: `Complete certificate processing queued for ${certificate.recipients.length} recipients`,
    certificateId: certificate.id,
    summary: {
      pdfJobs: pdfJobs.length,
      emailJobs: emailJobs.length,
      totalRecipients: certificate.recipients.length
    },
    jobs: {
      pdfGeneration: pdfJobs,
      emailSending: emailJobs
    }
  });
});

/**
 * Get job status for a certificate
 */
export const getCertificateJobStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  
  const certificate = await Certificate.findByPk(id);
  if (!certificate) throw new ErrorResponse("Certificate not found", 404);

  try {
    const { getQueueStats } = await import("../utils/queueService.js");
    const stats = await getQueueStats();
    
    res.status(200).json({
      certificateId: certificate.id,
      queueStats: stats
    });
  } catch (error) {
    console.error("Error getting queue stats:", error);
    res.status(500).json({
      message: "Error retrieving queue statistics",
      error: error.message
    });
  }
});