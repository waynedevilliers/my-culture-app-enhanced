import express from 'express';
import { pagination } from '../middlewares/pagination.js';
import {
  createBlog,
  deleteBlog,
  findAllBlogs,
  findLastBlog,
  findOneBlogById,
  updateBlog,
} from '../controllers/blog.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router
.route("/")
.get(pagination, findAllBlogs)
.post(authenticate, authorize, createBlog)

router
.route("/last")
.get(findLastBlog)

router
.route("/:id")
.get(findOneBlogById)
.put(authenticate, authorize, updateBlog)
.delete(authenticate, authorize, deleteBlog)

export default router;