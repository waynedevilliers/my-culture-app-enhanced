import Joi from 'joi';

export const userSchema = {
  POST: Joi.object({
    firstName: Joi.string().min(3).max(40).optional(),
    lastName: Joi.string().min(3).max(40).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    phoneNumber: Joi.string().min(10).max(15).optional(),
    role: Joi.string().valid('user', 'admin').optional(),
    newsletter: Joi.boolean().optional(),
  }),
  PUT: Joi.object({
    firstName: Joi.string().min(3).max(40).optional(),
    lastName: Joi.string().min(3).max(40).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(8).max(50).optional(),
    phoneNumber: Joi.string().min(8).max(15).optional(),
    role: Joi.string().valid('user', 'admin').optional(),
    newsletter: Joi.boolean().optional(),
  }),
};