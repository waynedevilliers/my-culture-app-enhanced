import Joi from "joi";

export const eventSchema = {
  POST: Joi.object({
    title: Joi.string().max(255).required(),
    date: Joi.date().required(),
    content: Joi.any().required(),
    imageId: Joi.number().integer().required(),
    locationId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    discountedPrice: Joi.number().optional(),
    abendkassePrice: Joi.number().optional(),
    prebookedPrice: Joi.number().optional(),
    published: Joi.boolean().default(false),
  }),
  PUT: Joi.object({
    title: Joi.string().max(255).optional(),
    date: Joi.date().optional(),
    content: Joi.any().optional(),
    imageId: Joi.number().integer().optional(),
    locationId: Joi.number().integer().optional(),
    userId: Joi.number().integer().optional(),
    discountedPrice: Joi.number().optional(),
    abendkassePrice: Joi.number().optional(),
    prebookedPrice: Joi.number().optional(),
    published: Joi.boolean().optional(),
  }),
};
