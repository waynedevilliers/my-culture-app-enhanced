import Joi from "joi";

export const newsletterSchema = {
  POST: Joi.object({
    subject: Joi.string().max(255).required(),
    content: Joi.any().required(),
  }),
  PUT: Joi.object({
    subject: Joi.string().max(255).optional(),
    content: Joi.any().optional(),
  }),
}