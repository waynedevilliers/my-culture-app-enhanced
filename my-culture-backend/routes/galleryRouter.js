import express from 'express';
import { pagination } from '../middlewares/pagination.js';
import {
  createGallery,
  deleteGallery,
  findAllGalleries,
  findPublishedGalleries,
  findOneGalleryById,
  updateGallery,
} from '../controllers/gallery.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router
.route("/")
.get(pagination, findAllGalleries)
.post(authenticate, authorize, createGallery)

router
.route("/published")
.get(findPublishedGalleries)

router
.route("/:id")
.get(findOneGalleryById)
.put(authenticate, authorize, updateGallery)
.delete(authenticate, authorize, deleteGallery)

export default router;