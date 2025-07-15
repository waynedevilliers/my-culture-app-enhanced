import fs from "fs/promises";
import path from "path";
import { Certificate, CertificateRecipient } from "../db.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { getTemplateById, generateCertificateContent } from "../utils/certificateTemplates.js";

export const generateCertificatePages = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const certificate = await Certificate.findByPk(id, {
    include: [{ model: CertificateRecipient, as: "recipients" }], 
  });

  if (!certificate) throw new ErrorResponse("Certificate not found", 404);
  if (!certificate.recipients || certificate.recipients.length === 0) {
    throw new ErrorResponse("No recipients found for this certificate", 400);
  }

  const baseUrl = process.env.URL || "http://localhost:3000";
  const dirPath = path.join("public", "certificates");

  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }

  const generatedLinks = [];
  const generatePromises = [];

  for (const recipient of certificate.recipients) {
    const recipientFileName = `${id}-${recipient.id}.html`;
    const recipientUrl = new URL(`/certificates/${recipientFileName}`, baseUrl).href;

    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipientUrl)}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(recipientUrl)}&text=${encodeURIComponent("I earned a certificate!")}`;

    // Get the template (use templateId from certificate or default to elegant-gold)
    const templateId = certificate.templateId || 'elegant-gold';
    const template = getTemplateById(templateId);
    
    // Prepare certificate data
    const certificateData = {
      participant: recipient.name,
      event: certificate.title,
      issueDate: new Date(certificate.issuedDate).toDateString(),
      signature: certificate.signature || null,
      organizationName: certificate.issuedFrom
    };
    
    // Generate the certificate content and styles using the template system
    const { styles, content } = generateCertificateContent(template, certificateData);
    
    // Create the full HTML with sharing and download functionality
    const certificateHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Certificate - ${certificate.title}</title>
        
        <!-- Open Graph Meta Tags (For Facebook Sharing) -->
        <meta property="og:title" content="Certificate - ${certificate.title}" />
        <meta property="og:description" content="${certificate.description}" />
        <meta property="og:url" content="${recipientUrl}" />
        <meta property="og:type" content="website" />

        <!-- No client-side libraries needed - using server-side generation -->
        
        <!-- Load Google Fonts for templates -->
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;600&family=Inter:wght@400;500;600;700&family=Crimson+Text:wght@400;600&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">

        <style>
          body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f7f7f7;
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          
          #certificate-wrapper {
            margin-bottom: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }
          
          /* Ensure certificate containers display properly */
          .certificate-container {
            max-width: 1123px !important;
            width: auto !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
          
          /* Responsive design for smaller screens */
          @media (max-width: 1200px) {
            .certificate-container {
              max-width: 95vw !important;
              transform: scale(0.9);
              transform-origin: center;
            }
          }
          
          @media (max-width: 800px) {
            .certificate-container {
              max-width: 95vw !important;
              transform: scale(0.75);
              transform-origin: center;
            }
            
            body {
              padding: 10px;
            }
          }
          
          @media (max-width: 600px) {
            .certificate-container {
              max-width: 95vw !important;
              transform: scale(0.6);
              transform-origin: center;
            }
          }
          
          /* Certificate Template Styles */
          ${styles}
          
          .share-buttons, .download-buttons {
            margin: 20px 0;
            text-align: center;
          }
          .share-buttons a button, .download-buttons button {
            padding: 12px 24px;
            margin: 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.2em;
            color: #fff;
            border: none;
            outline: none;
            transition: transform 0.2s;
          }
          .share-buttons a button:hover, .download-buttons button:hover {
            transform: translateY(-2px);
          }
          .share-facebook { background: #3b5998; }
          .share-twitter { background: #1da1f2; }
          .download-pdf { background: #27ae60; }
          .download-jpeg { background: #e67e22; }
          
          .action-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 600px;
          }
          
          .action-section h3 {
            margin-top: 0;
            color: #2c3e50;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div id="certificate-wrapper">
          ${content}
        </div>
        
        <div class="action-section">
          <div class="share-buttons">
            <h3>Share your achievement:</h3>
            <a href="${facebookShareUrl}" target="_blank">
              <button class="share-facebook">Share on Facebook</button>
            </a>
            <a href="${twitterShareUrl}" target="_blank">
              <button class="share-twitter">Share on Twitter</button>
            </a>
          </div>
          
          <div class="download-buttons">
            <h3>Download your certificate:</h3>
            <button class="download-pdf" id="download-pdf">Download High-Quality PDF</button>
            <button class="download-jpeg" id="download-jpeg">Download High-Quality PNG</button>
            <div id="download-status" style="margin-top: 15px; text-align: center; color: #666;"></div>
          </div>
        </div>
        
        <script>
          const baseUrl = '${process.env.URL || "http://localhost:3000"}';
          const certificateId = ${id};
          
          function showStatus(message, isError = false) {
            const status = document.getElementById('download-status');
            status.textContent = message;
            status.style.color = isError ? '#e74c3c' : '#27ae60';
          }
          
          function downloadFile(endpoint, filename) {
            showStatus('Generating file, please wait...');
            
            fetch(endpoint)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Download failed');
                }
                return response.blob();
              })
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                showStatus('Download completed successfully!');
                setTimeout(() => {
                  document.getElementById('download-status').textContent = '';
                }, 3000);
              })
              .catch(error => {
                console.error('Download error:', error);
                showStatus('Download failed. Please try again.', true);
              });
          }

          document.getElementById("download-pdf").addEventListener("click", function () {
            const endpoint = \`\${baseUrl}/api/certificates/\${certificateId}/pdf\`;
            downloadFile(endpoint, 'certificate.pdf');
          });

          document.getElementById("download-jpeg").addEventListener("click", function () {
            const endpoint = \`\${baseUrl}/api/certificates/\${certificateId}/png\`;
            downloadFile(endpoint, 'certificate.png');
          });
        </script>
      </body>
      </html>
    `;

    // Create a promise for each certificate generation
    const generatePromise = async () => {
      await fs.writeFile(path.join(dirPath, recipientFileName), certificateHtml);
      
      await CertificateRecipient.update(
        { recipientUrl },
        { where: { id: recipient.id } }
      );

      return { name: recipient.name, url: recipientUrl };
    };

    generatePromises.push(generatePromise());
  }

  // Wait for all certificates to be generated concurrently
  const results = await Promise.all(generatePromises);
  generatedLinks.push(...results);

  res.status(200).json({ message: "Certificates generated", links: generatedLinks });
});

/**
 * Generate HTML content for a certificate (used by PDF generator)
 * @param {Object} certificate - Certificate object from database
 * @returns {string} - Complete HTML content for the certificate
 */
export async function generateCertificateHTML(certificate) {
  // Get the template (use templateId from certificate or default to elegant-gold)
  const templateId = certificate.templateId || 'elegant-gold';
  const template = getTemplateById(templateId);
  
  // Use first recipient for single certificate generation
  // For multiple recipients, this should be called per recipient
  const recipient = certificate.recipients?.[0];
  if (!recipient) {
    throw new Error('No recipients found for certificate');
  }
  
  // Prepare certificate data
  const certificateData = {
    participant: recipient.name,
    event: certificate.title,
    issueDate: new Date(certificate.issuedDate).toDateString(),
    signature: certificate.signature || null,
    organizationName: certificate.issuedFrom
  };
  
  // Generate the certificate content and styles using the template system
  const { styles, content } = generateCertificateContent(template, certificateData);
  
  // Create the full HTML optimized for PDF generation
  const certificateHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Certificate - ${certificate.title}</title>
      
      <!-- Load Google Fonts for templates -->
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;600&family=Inter:wght@400;500;600;700&family=Crimson+Text:wght@400;600&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">

      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: #f5f5f5;
          padding: 20px;
          margin: 0;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }

        .certificate-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        
        /* Ensure certificate containers are properly sized */
        .certificate-container {
          max-width: 1123px !important;
          min-height: 794px !important;
          width: auto !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
          box-sizing: border-box !important;
        }

        /* Print-optimized styles */
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .certificate-wrapper {
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .action-section {
            display: none !important;
          }
        }

        /* Template-specific styles */
        ${styles}
        
        /* Hide action buttons for clean PDF */
        .action-section {
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="certificate-wrapper" id="certificate-wrapper">
        ${content}
      </div>
    </body>
    </html>
  `;

  return certificateHtml;
}

