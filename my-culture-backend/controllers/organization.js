import asyncWrapper from "../utils/asyncWrapper.js";
import {Organization} from "../db.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { Image } from "../db.js";

export const findPublishedOrganizations = asyncWrapper(async (req, res) => {
  const publishedOrganizations = await Organization.findAll({
    where: {
      published: true,
    },
    limit: 5,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: { model: Image},
  });

  res.status(200).json( publishedOrganizations);
});

export const findAllOrganizations = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = res.pagination;

  const entries = await Organization.findAndCountAll({
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    distinct: true,
    include: { model: Image, required: false }, 
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

export const findOneOrganizationById = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const entry = await Organization.findByPk(id, {
    include: { model: Image },
  });
  res.status(200).json(entry);
});

export const createOrganization = asyncWrapper(async (req, res) => {
  const { body } = req;
  const { name, description, website, phone, email, imageId } = body; 

  const organization = await Organization.create({
    name,
    description,
    website,
    phone,
    email,
    imageId: imageId || null,  
  });

  res.status(201).json(organization);
});

export const updateOrganization = asyncWrapper(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const [updatedRows] = await Organization.update(body, { where: { id } });

    if (updatedRows === 0) {
      return next(new ErrorResponse("Entry not found", 404));
    }

    const newOrganization = await Organization.findByPk(id, {
      include: { model: Image },
    });

    res.status(202).json(newOrganization);
  } catch (error) {
    next(error);
  }
});



export const deleteOrganization = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;

  const deleted = await Organization.destroy({ where: { id } });
  if (!deleted) throw new ErrorResponse("Entry not found", 404);


  const responseMessage = {
    message: `Entry with id ${id} was deleted successfully`,
  };
  res.status(200).json(responseMessage);
});
