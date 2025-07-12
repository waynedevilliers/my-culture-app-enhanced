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

        <!-- Required libraries for PDF and JPEG generation -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        
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
            <button class="download-pdf" id="download-pdf">Download as PDF</button>
            <button class="download-jpeg" id="download-jpeg">Download as JPEG</button>
          </div>
        </div>
        
        <script>
          function captureCertificate(callback) {
            const actionSection = document.querySelector('.action-section');
            actionSection.style.display = 'none';
            
            html2canvas(document.getElementById("certificate-wrapper")).then(canvas => {
              actionSection.style.display = '';
              callback(canvas);
            });
          }

          document.getElementById("download-pdf").addEventListener("click", function () {
            captureCertificate(function(canvas) {
              const imgData = canvas.toDataURL("image/png");
              const { jsPDF } = window.jspdf;
              const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);
              pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
              pdf.save("certificate.pdf");
            });
          });

          document.getElementById("download-jpeg").addEventListener("click", function () {
            captureCertificate(function(canvas) {
              const link = document.createElement("a");
              link.download = "certificate.jpeg";
              link.href = canvas.toDataURL("image/jpeg");
              link.click();
            });
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

