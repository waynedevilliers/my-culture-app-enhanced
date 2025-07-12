import Joi from "joi";

export const gallerySchema = {
  POST: Joi.object({
    title: Joi.string().max(255).required(),
    content: Joi.string().required(),
    published: Joi.boolean().default(false),
  }),
  PUT: Joi.object({
    title: Joi.string().max(255).optional(),
    content: Joi.string().optional(),
    published: Joi.boolean().optional(),
  }),
};
