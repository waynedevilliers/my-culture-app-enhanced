import express from "express";
import { authenticate } from '../middlewares/authenticate.js';
import fileUploader from '../middlewares/fileUploader.js';
import cloudUploader from '../middlewares/cloudUploader.js';
import { imageHandler } from '../controllers/image.js';
import { authorize } from '../middlewares/authorize.js';
import { imageCheck } from "../middlewares/imageCheck.js";

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  authorize,
  fileUploader.single('image'),
  imageCheck,
  cloudUploader,
  imageHandler,
);

export default router;