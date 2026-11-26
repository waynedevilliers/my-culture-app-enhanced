import asyncWrapper from '../utils/asyncWrapper.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { Image } from "../db.js";
import { getFileUrl } from '../middlewares/storageHandler.js';

export const imageHandler = asyncWrapper(async (req, res) => {
  const url = getFileUrl(req);
  if (!url) {
    throw new ErrorResponse("Image upload failed", 500);
  }

  const payload = {
    ...req.body,
    url,
    userId: req.user.id,
  };

  const file = await Image.create(payload);

  return res.status(201).json(file);
});
