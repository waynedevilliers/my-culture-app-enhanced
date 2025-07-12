import asyncWrapper from '../utils/asyncWrapper.js';
import { Image } from "../db.js";

export const imageHandler = asyncWrapper(async (req, res) => {
  const payload = {
    ...req.body,
    url: req.cloudinaryURL,
    userId: req.user.id,
  };

  const file = await Image.create(payload);

  return res.status(201).json(file);
});