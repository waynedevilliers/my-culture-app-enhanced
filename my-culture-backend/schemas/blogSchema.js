import Joi from "joi";

export const blogSchema = {
  POST: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(5000).required(),
    userId: Joi.number().integer().required(),
    imageId: Joi.number().integer().required(),
  }),
  PUT: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(5000).optional(),
    userId: Joi.number().integer().optional(),
    imageId: Joi.number().integer().optional(),
  }),
};
