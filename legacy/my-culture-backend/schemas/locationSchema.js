import Joi from "joi";

export const locationSchema = {
  POST: Joi.object({
    name: Joi.string().max(255).required(),
    street: Joi.string().max(255).required(),
    houseNumber: Joi.string().optional(),
    postalCode: Joi.number().integer().required(),
    city: Joi.string().max(255).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),
  PUT: Joi.object({
    name: Joi.string().max(255).optional(),
    street: Joi.string().max(255).optional(),
    houseNumber: Joi.string().optional(),
    postalCode: Joi.number().integer().optional(),
    city: Joi.string().max(255).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
  }),
};
