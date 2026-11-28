export const certificateSchema = {
  POST: Joi.object({
    title: Joi.string().trim().min(3).max(255).required().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must not exceed 255 characters",
    }),
    description: Joi.string().trim().max(5000).required().messages({
      "string.empty": "Description is required",
      "string.max": "Description must not exceed 5000 characters",
    }),
    issuedDate: Joi.date().iso().required().messages({
      "date.base": "Issued Date must be a valid date",
    }),
    issuedFrom: Joi.string().trim().min(3).max(255).required().messages({
      "string.empty": "Issued From is required",
      "string.min": "Issued From must be at least 3 characters long",
      "string.max": "Issued From must not exceed 255 characters",
    }),
    certificateUrl: Joi.string().uri().optional(),
    published: Joi.boolean().default(false),

    // ✅ Ensure recipients array is required
    recipients: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().min(3).max(255).required().messages({
            "string.empty": "Recipient Name is required",
            "string.min": "Recipient Name must be at least 3 characters long",
            "string.max": "Recipient Name must not exceed 255 characters",
          }),
          email: Joi.string().trim().email().required().messages({
            "string.empty": "Recipient Email is required",
            "string.email": "Recipient Email must be a valid email",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least one recipient is required",
      }),
  }),

  PUT: Joi.object({
    title: Joi.string().trim().min(3).max(255).optional(),
    description: Joi.string().trim().max(5000).optional(),
    issuedDate: Joi.date().iso().optional(),
    issuedFrom: Joi.string().trim().min(3).max(255).optional(),
    certificateUrl: Joi.string().uri().optional(),
    published: Joi.boolean().optional(),
  }),
};

