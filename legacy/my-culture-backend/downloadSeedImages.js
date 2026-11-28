import https from 'https';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { SEED_IMAGES } from './utils/seedImages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'public', 'uploads', 'organizations');

const downloadImage = (url, outputPath) => new Promise((resolve, reject) => {
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      response.resume();
      reject(new Error(`HTTP ${response.statusCode}`));
      return;
    }

    pipeline(response, fs.createWriteStream(outputPath)).then(resolve, (error) => {
      fs.rm(outputPath, { force: true }, () => reject(error));
    });
  }).on('error', reject);
});

async function downloadAllImages() {
  console.log(`Downloading seed images to ${path.relative(__dirname, OUTPUT_DIR)}/`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const failures = [];
  for (const [filename, url] of Object.entries(SEED_IMAGES)) {
    try {
      await downloadImage(url, path.join(OUTPUT_DIR, filename));
      console.log(`  downloaded ${filename}`);
    } catch (error) {
      failures.push(filename);
      console.error(`  failed ${filename}: ${error.message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`${failures.length} of ${Object.keys(SEED_IMAGES).length} images failed to download.`);
    process.exitCode = 1;
    return;
  }

  console.log('All seed images downloaded. Next: npm run seed:organizations');
}

downloadAllImages();
