import asyncWrapper from "../utils/asyncWrapper.js";
import { Gallery, Image, ImageGallery } from "../db.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const findPublishedGalleries = asyncWrapper(async (req, res) => {
  const publishGalleries = await Gallery.findAll({
    where: {
      published: true,
    },
    limit: 5,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [{ model: Image }],
  });

  res.status(200).json( publishGalleries);
});

export const findAllGalleries = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = res.pagination;
  const entries = await Gallery.findAndCountAll({
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: [{ model: Image }],
  });

  const totalCount = entries.count;
  const totalPages = Math.ceil(totalCount / limit);

  const paginationData = {
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  res.status(200).json({ ...paginationData, results: entries.rows });
});

export const findOneGalleryById = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const entry = await Gallery.findByPk(id, {
    include: [{ model: Image }],
  });
  res.status(200).json(entry);
});

export const createGallery = asyncWrapper(async (req, res) => {
  const { body } = req;
  const gallery = await Gallery.create({
    title: body.title,
    content: body.content,
  });

  let images = [];
  for (const image of body.Images) {
    images.push({ ImageId: image.id, GalleryId: gallery.id });
  }
  await ImageGallery.bulkCreate(images);

  const newGallery = await Gallery.findByPk(gallery.id, {
    include: [{ model: Image }],
  });

  res.status(201).json(newGallery);
});

export const updateGallery = asyncWrapper(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const updatedGallery = await Gallery.update(
    {
      title: body.title,
      content: body.content,
      published: body.published,
    },
    { where: { id } }
  );

  if (!updatedGallery) throw new ErrorResponse("Entry not found", 404);
  await ImageGallery.destroy({ where: { GalleryId: id } });

  let images = [];
  for (const image of body.Images) {
    images.push({ ImageId: image.id, GalleryId: id });
  }
  await ImageGallery.bulkCreate(images);

  const newGallery = await Gallery.findByPk(id, {
    include: [{ model: Image }],
  });

  res.status(202).json(newGallery);
});

export const deleteGallery = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;

  const deleted = await Gallery.destroy({ where: { id } });
  if (!deleted) throw new ErrorResponse("Entry not found", 404);

  await ImageGallery.destroy({ where: { GalleryId: id } });

  const responseMessage = {
    message: `Entry with id ${id} was deleted successfully`,
  };
  res.status(200).json(responseMessage);
});
