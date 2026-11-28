import asyncWrapper from '../utils/asyncWrapper.js';
import { Blog, Image, User } from '../db.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { Op } from 'sequelize';
import { getPaginatedData } from '../utils/paginationService.js';

export const findLastBlog = asyncWrapper(async (req, res) => {
  const lastBlog = await Blog.findAll({
    where: {
      createdAt: {
        [Op.lt]: new Date(),
      },
    },
    order: [['createdAt', 'DESC']],
    limit: 1,
    include: [
      { model: User },
      { model: Image },
    ],
  });

  res.status(200).json(lastBlog);
});

export const findAllBlogs = asyncWrapper(async (req, res) => {
  const result = await getPaginatedData(Blog, {
    pagination: res.pagination,
    include: [
      { model: User, required: false },
      { model: Image, required: false },
    ],
  });

  res.status(200).json(result);
});

export const findOneBlogById = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const entry = await Blog.findByPk(id, {
    include: [
      { model: User },
      { model: Image },
    ],
  });
  res.status(200).json(entry);
});

export const createBlog = asyncWrapper(async (req, res) => {
  const { body } = req;

  const blog = await Blog.create({
    title: body.title,
    description: body.description,
    userId: req.user.id,
    imageId: body.imageId,
  });
  const newBlog = await Blog.findByPk(blog.id, {
    include: [
      { model: User },
      { model: Image },
    ],
  });

  res.status(201).json(newBlog);
});

export const updateBlog = asyncWrapper(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const updatedBlog = await Blog.update(
    {
      title: body.title,
      description: body.description,
      imageId: body.imageId,
    },
    { where: { id } },
  );
  if (!updatedBlog) throw new ErrorResponse("Entry not found", 404);

  const newBlog = await Blog.findByPk(id, {
    include: [
      { model: User },
      { model: Image },
    ],
  });

  res.status(202).json(newBlog);
});

export const deleteBlog = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const deleted = await Blog.destroy({ where: { id } });
  if (!deleted) throw new ErrorResponse("Entry not found", 404);

  const responseMessage = { message: `Entry with id ${id} was deleted successfully.` };
  res.status(200).json(responseMessage);
});