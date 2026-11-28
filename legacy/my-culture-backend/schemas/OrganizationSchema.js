export const organizationSchema = {
  POST: Joi.object({
    name: Joi.string().trim().min(3).max(255).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters long",
      "string.max": "Name must not exceed 255 characters",
    }),
    description: Joi.string().trim().max(5000).required().messages({
      "string.empty": "Description is required",
      "string.max": "Description must not exceed 5000 characters",
    }),
    website: Joi.string().trim().uri().allow(null, "").optional().messages({
      "string.uri": "Website must be a valid URL",
    }),
    phone: Joi.string()
      .trim()
      .pattern(/^\+(?:[0-9] ?){6,14}[0-9]$/)
      .allow(null, "")
      .optional()
      .messages({
        "string.pattern.base": "Phone must be a valid phone number",
      }),
    email: Joi.string().trim().email().allow(null, "").optional().messages({
      "string.email": "Email must be a valid email address",
    }),
    imageId: Joi.number().integer().required(),
    published: Joi.boolean().default(false),
  }),

  PUT: Joi.object({
    name: Joi.string().trim().min(3).max(255).optional(),
    description: Joi.string().trim().max(5000).optional(),
    website: Joi.string().trim().uri().allow(null, "").optional(),
    phone: Joi.string()
      .trim()
      .pattern(/^\+(?:[0-9] ?){6,14}[0-9]$/)
      .allow(null, "")
      .optional(),
    email: Joi.string().trim().email().allow(null, "").optional(),
    imageId: Joi.number().integer().optional(),
    published: Joi.boolean().optional(),
  }),
};
