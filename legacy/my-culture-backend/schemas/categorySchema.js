import Joi from 'joi';

export const categorySchema = {
  POST: Joi.object({
    value: Joi.string().min(3).max(40).required(),
    label: Joi.string().min(3).max(40).required(),
  }),
  PUT: Joi.object({
    value: Joi.string().min(3).max(40).required(),
    label: Joi.string().min(3).max(40).required(),
  })
}
