import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Images from seedOrganizations.js
const images = [
  {
    url: "https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331010/image_2025-07-12_163647645_l8j9hk.png",
    filename: "berlin-heritage.png"
  },
  {
    url: "https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331019/cc-illustrative-map_blxbr6.png",
    filename: "munich-music.png"
  },
  {
    url: "https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331032/lg_1panel-color_0_yrdrkr.png",
    filename: "hamburg-arts.png"
  },
  {
    url: "https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331058/people-connecting-puzzle-pieces-colorful-background_23-2148085523_ynhsf4.jpg",
    filename: "cologne-theater.jpg"
  },
  {
    url: "https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331082/download_znnxs8.jpg",
    filename: "frankfurt-dance.jpg"
  },
  {
    url: "https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331042/8-Key-Components_jrwjtr.png",
    filename: "stuttgart-multicultural.png"
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(__dirname, 'public', 'uploads', 'organizations', filename);
    const file = fs.createWriteStream(outputPath);

    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
};

async function downloadAllImages() {
  console.log('📥 Starting image download...');
  console.log(`📂 Output directory: public/uploads/organizations/\n`);

  // Ensure directory exists
  const uploadDir = path.join(__dirname, 'public', 'uploads', 'organizations');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.error(`❌ Error downloading ${image.filename}:`, error.message);
    }
  }

  console.log('\n🎉 All images downloaded successfully!');
  console.log('📝 You can now run: npm run seed:organizations');
}

downloadAllImages();
