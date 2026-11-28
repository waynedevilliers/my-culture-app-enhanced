import nodemailer from "nodemailer";
import { Certificate, CertificateRecipient } from "../db.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const sendCertificateEmail = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  // Fetch certificate details with recipients
  const certificate = await Certificate.findByPk(id, {
    include: { model: CertificateRecipient, as: "recipients" },
  });

  if (!certificate) throw new ErrorResponse("Certificate not found", 404);
  if (!certificate.recipients || certificate.recipients.length === 0) {
    throw new ErrorResponse("No recipients found for this certificate", 400);
  }

  // Email transport configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    tls: { rejectUnauthorized: false },
    debug: true,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let sentEmails = [];
  let failedEmails = [];

  // Send emails concurrently using Promise.all()
  const emailPromises = certificate.recipients.map(async (recipient) => {
    if (!recipient.recipientUrl) {
      failedEmails.push({ recipient: recipient.email, error: "Certificate page not generated" });
      return;
    }

    const emailSubject = `🎉 Congratulations! Your Certificate for "${certificate.title}"`;
    const emailBody = `
      <p>Dear ${recipient.name},</p>
      <p>We are pleased to inform you that you have been awarded the following certificate:</p>
      <h2>${certificate.title}</h2>
      <p>${certificate.description}</p>
      <p><strong>Issued Date:</strong> ${new Date(certificate.issuedDate).toDateString()}</p>
      <p>You can view and share your certificate here:</p>
      <p><a href="${recipient.recipientUrl}" target="_blank">${recipient.recipientUrl}</a></p>
      <p>Feel free to share it on social media!</p>
      <p>Best regards,</p>
      <p><strong>${certificate.issuedFrom}</strong></p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject: emailSubject,
      html: emailBody,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to: ${recipient.email}`, info);
      sentEmails.push(recipient.email);
    } catch (error) {
      console.error(`Error sending email to ${recipient.email}:`, error);
      failedEmails.push({ recipient: recipient.recipientEmail, error: error.message });
    }
  });

  // Wait for all emails to be processed
  await Promise.all(emailPromises);

  res.status(200).json({
    message: "Certificate emails processed",
    sentEmails,
    failedEmails,
  });

  console.log(`Certificates sent to: ${sentEmails.length} recipients`);
  if (failedEmails.length > 0) console.log(`Failed emails:`, failedEmails);
});
