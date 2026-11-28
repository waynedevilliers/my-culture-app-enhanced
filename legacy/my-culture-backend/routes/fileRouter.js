import express from "express";
import { authenticate } from '../middlewares/authenticate.js';
import { createStorage } from '../middlewares/storageHandler.js';
import { imageHandler } from '../controllers/image.js';
import { authorize } from '../middlewares/authorize.js';
import { imageCheck } from "../middlewares/imageCheck.js";

const router = express.Router();
const imageStorage = createStorage('images');

router.post(
  "/upload",
  authenticate,
  authorize,
  imageStorage.uploader.single('image'),
  imageCheck,
  imageStorage.urlGenerator,
  imageHandler,
);

export default router;
