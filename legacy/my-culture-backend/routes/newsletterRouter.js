import express from "express";
import {
  createNewsletter,
  sendNewsletter,
} from "../controllers/newsletter.js";
import { authorize } from '../middlewares/authorize.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/', authenticate, authorize, createNewsletter);
router.post('/send', authenticate, authorize, sendNewsletter);

export default router;
