import asyncWrapper from "../utils/asyncWrapper.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { getPaginatedData } from "../utils/paginationService.js";

export const findAll = asyncWrapper(async (req, res) => {
  const result = await getPaginatedData(req.model, {
    pagination: res.pagination,
    include: req.modelIncludes || undefined,
    where: req.modelWhere || undefined,
  });

  res.status(200).json(result);
})

export const findOneById = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const entry = await req.model.findByPk(id, {
    include: req.modelIncludes || undefined,
  });
  if (!entry) {
    throw new ErrorResponse("Entry not found", 404);
  }
  res.status(200).json(entry);
});

export const createOne = asyncWrapper(async (req, res) => {
  const { body } = req;
  const entry = await req.model.create(body);
  res.status(201).json(entry);
});

export const updateOne = asyncWrapper(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const [updated] = await req.model.update(body, {
    where: { id },
  });

  if (!updated) {
    throw new ErrorResponse("Entry not found", 404);
  }
  const updatedEntry = await req.model.findByPk(id, {
    include: req.modelIncludes || undefined,
  });
  res.status(202).json(updatedEntry);
});

export const deleteOne = asyncWrapper(async (req, res) => {
  const {
    params: { id },
  } = req;
  const deleted = await req.model.destroy({
    where: { id },
  });

  if (!deleted) {
    throw new ErrorResponse("Entry not found", 404);
  }

  const responseMessage = { message: `Entry with id ${id} was deleted successfully` }
  res.status(200).json(responseMessage);
});
