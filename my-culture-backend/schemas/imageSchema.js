import Joi from "joi";

export const imageSchema = {
  POST: Joi.object({
    name: Joi.string().max(255).required(),
    url: Joi.string().uri().required(),
    userId: Joi.number().integer().required(),
  }),
  PUT: Joi.object({
    name: Joi.string().max(255).optional(),
    url: Joi.string().uri().optional(),
    userId: Joi.number().integer().optional(),
  }),
};
