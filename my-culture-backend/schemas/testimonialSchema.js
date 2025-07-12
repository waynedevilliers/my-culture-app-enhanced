import Joi from 'joi';

export const testimonialSchema = {
  POST: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    affiliation: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(2000).required(),
    rating: Joi.number().min(1).max(5).required(),
  }),
  PUT: Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    affiliation: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(2000).optional(),
    rating: Joi.number().min(1).max(5).optional(),
  }),
};