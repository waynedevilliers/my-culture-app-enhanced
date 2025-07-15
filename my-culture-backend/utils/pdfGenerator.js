import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Generate PDF from HTML certificate using Puppeteer
 * @param {string} certificateId - The certificate ID
 * @param {string} htmlContent - The complete HTML content for the certificate
 * @returns {Promise<string>} - Path to the generated PDF file
 */
export async function generateCertificatePDF(certificateId, htmlContent) {
  let browser;
  
  try {
    // Launch Puppeteer with optimized settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1123, // A4 landscape width at 150 DPI
      height: 794,  // A4 landscape height at 150 DPI
      deviceScaleFactor: 2 // High DPI for crisp text
    });

    // Set content and wait for fonts and images to load
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'load']
    });

    // Wait for Google Fonts to load
    await page.evaluate(() => {
      return document.fonts.ready;
    });

    // Find the certificate element for cropping
    const certificateElement = await page.$('.certificate-container');
    if (!certificateElement) {
      throw new Error('Certificate container not found');
    }

    // Take a screenshot of just the certificate element first
    const imageBuffer = await certificateElement.screenshot({
      type: 'png',
      omitBackground: false
    });

    // Get the element's dimensions for PDF sizing
    const boundingBox = await certificateElement.boundingBox();
    if (!boundingBox) {
      throw new Error('Could not get certificate dimensions');
    }

    // Create a new page with exact certificate dimensions
    const pdfPage = await browser.newPage();
    await pdfPage.setViewport({
      width: Math.ceil(boundingBox.width),
      height: Math.ceil(boundingBox.height),
      deviceScaleFactor: 2
    });

    // Create minimal HTML that displays the certificate at exact dimensions
    const croppedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            width: ${Math.ceil(boundingBox.width)}px; 
            height: ${Math.ceil(boundingBox.height)}px;
            overflow: hidden;
            background: white;
          }
          img { 
            width: 100%; 
            height: 100%; 
            object-fit: contain;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="data:image/png;base64,${imageBuffer.toString('base64')}" />
      </body>
      </html>
    `;

    await pdfPage.setContent(croppedHtml, { waitUntil: 'networkidle0' });

    // Generate PDF with exact certificate dimensions
    const widthMm = (boundingBox.width * 25.4) / 96;
    const heightMm = (boundingBox.height * 25.4) / 96;

    const pdfBuffer = await pdfPage.pdf({
      width: `${widthMm}mm`,
      height: `${heightMm}mm`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      scale: 1.0
    });

    await pdfPage.close();

    // Save PDF to file system
    const pdfDir = path.join(process.cwd(), 'public', 'certificates', 'pdfs');
    await fs.mkdir(pdfDir, { recursive: true });
    
    const pdfPath = path.join(pdfDir, `${certificateId}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);

    console.log(`✅ PDF generated successfully: ${pdfPath}`);
    
    return pdfPath;

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate high-quality PNG image from HTML certificate
 * @param {string} certificateId - The certificate ID
 * @param {string} htmlContent - The complete HTML content for the certificate
 * @returns {Promise<string>} - Path to the generated PNG file
 */
export async function generateCertificatePNG(certificateId, htmlContent) {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    // Set high-resolution viewport
    await page.setViewport({
      width: 1123,
      height: 794,
      deviceScaleFactor: 3 // Extra high DPI for PNG
    });

    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'load']
    });

    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready;
    });

    // Hide action buttons for clean certificate
    await page.evaluate(() => {
      const actionSection = document.querySelector('.action-section');
      if (actionSection) {
        actionSection.style.display = 'none';
      }
    });

    // Generate high-quality PNG from certificate container
    const element = await page.$('.certificate-container');
    if (!element) {
      throw new Error('Certificate container not found');
    }
    
    const imageBuffer = await element.screenshot({
      type: 'png',
      omitBackground: false,
      quality: 100
    });

    // Save PNG to file system
    const imgDir = path.join(process.cwd(), 'public', 'certificates', 'images');
    await fs.mkdir(imgDir, { recursive: true });
    
    const imagePath = path.join(imgDir, `${certificateId}.png`);
    await fs.writeFile(imagePath, imageBuffer);

    console.log(`✅ PNG generated successfully: ${imagePath}`);
    
    return imagePath;

  } catch (error) {
    console.error('❌ Error generating PNG:', error);
    throw new Error(`PNG generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Clean up old certificate files (optional maintenance function)
 * @param {number} daysOld - Delete files older than this many days
 */
export async function cleanupOldCertificates(daysOld = 30) {
  try {
    const dirs = [
      path.join(process.cwd(), 'public', 'certificates', 'pdfs'),
      path.join(process.cwd(), 'public', 'certificates', 'images')
    ];

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            console.log(`🗑️ Deleted old certificate file: ${file}`);
          }
        }
      } catch (error) {
        // Directory might not exist, continue
        console.log(`Directory ${dir} not found or empty`);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}