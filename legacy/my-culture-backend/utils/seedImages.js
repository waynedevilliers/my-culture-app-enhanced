import { buildLocalFileUrl } from '../middlewares/localFileUrl.js';

/**
 * Seed organization images: local file name -> hosted original.
 * downloadSeedImages.js copies the originals into public/uploads/organizations
 * for local development. Those files are git-ignored and never deployed, so
 * production seeds point at the hosted originals instead.
 */
export const SEED_IMAGES = Object.freeze({
  'berlin-heritage.png': 'https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331010/image_2025-07-12_163647645_l8j9hk.png',
  'munich-music.png': 'https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331019/cc-illustrative-map_blxbr6.png',
  'hamburg-arts.png': 'https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331032/lg_1panel-color_0_yrdrkr.png',
  'cologne-theater.jpg': 'https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331058/people-connecting-puzzle-pieces-colorful-background_23-2148085523_ynhsf4.jpg',
  'frankfurt-dance.jpg': 'https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331082/download_znnxs8.jpg',
  'stuttgart-multicultural.png': 'https://res.cloudinary.com/dz9nn5enp/image/upload/v1752331042/8-Key-Components_jrwjtr.png',
});

/**
 * URL to store for a seed image.
 *
 * @param {string} filename key of SEED_IMAGES
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export const getSeedImageUrl = (filename, env = process.env) => {
  const hostedUrl = SEED_IMAGES[filename];
  if (!hostedUrl) {
    throw new Error(`Unknown seed image: ${filename}`);
  }

  if (env.NODE_ENV === 'production') {
    return hostedUrl;
  }
  return buildLocalFileUrl('organizations', filename, env);
};
