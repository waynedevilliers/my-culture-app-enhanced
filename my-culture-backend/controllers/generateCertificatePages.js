import fs from "fs/promises";
import path from "path";
import { Certificate, CertificateRecipient } from "../db.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";

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

        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f7f7f7;
            margin: 0;
            padding: 20px;
          }
          .certificate-container {
            background: #fff;
            padding: 50px;
            border: 12px solid #d4af37;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
            max-width: 1000px;
            width: 90%;
            text-align: center;
            position: relative;
          }
          .certificate-container::before {
            content: "";
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 6px dashed #d4af37;
            pointer-events: none;
          }
          h1 {
            font-size: 3em;
            color: #2c3e50;
            margin-bottom: 20px;
            text-transform: uppercase;
          }
          .details {
            font-size: 1.5em;
            color: #34495e;
            margin-bottom: 10px;
          }
          .recipient {
            font-size: 2em;
            font-weight: bold;
            margin: 30px 0;
            color: #16a085;
          }
          .issuedFrom {
            font-size: 2em;
            font-weight: bold;
            margin: 30px 0;
            color: #1abc9c;
          }
          .issued-date {
            font-size: 1.2em;
            color: #7f8c8d;
          }
          .share-buttons, .download-buttons {
            margin-top: 40px;
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
          }
          .share-facebook { background: #3b5998; }
          .share-twitter { background: #1da1f2; }
          .download-pdf { background: #27ae60; }
          .download-jpeg { background: #e67e22; }
        </style>
      </head>
      <body>
        <div class="certificate-container" id="certificate">
          <h1>${certificate.title}</h1>
          <p class="details">${certificate.description}</p>
          <p class="recipient">Awarded to: ${recipient.name}</p>
          <p class="issuedFrom">Awarded by: ${certificate.issuedFrom}</p>
          <p class="issued-date">Issued on: ${new Date(certificate.issuedDate).toDateString()}</p>
          <div class="share-buttons">
            <p>Share your achievement:</p>
            <a href="${facebookShareUrl}" target="_blank">
              <button class="share-facebook">Share on Facebook</button>
            </a>
            <a href="${twitterShareUrl}" target="_blank">
              <button class="share-twitter">Share on Twitter</button>
            </a>
          </div>
          <div class="download-buttons">
            <p>Download your certificate:</p>
            <button class="download-pdf" id="download-pdf">Download as PDF</button>
            <button class="download-jpeg" id="download-jpeg">Download as JPEG</button>
          </div>
        </div>
        
        <script>
          function captureCertificate(callback) {
            const buttons = document.querySelectorAll('.share-buttons, .download-buttons');
            buttons.forEach(btn => btn.style.display = 'none');
            html2canvas(document.getElementById("certificate")).then(canvas => {
              buttons.forEach(btn => btn.style.display = '');
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

