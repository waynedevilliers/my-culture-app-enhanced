import { userSchema } from "../schemas/userSchema.js";
import { eventSchema } from "../schemas/eventSchema.js";
import { locationSchema } from "../schemas/locationSchema.js";
import { imageSchema } from "../schemas/imageSchema.js";
import { testimonialSchema } from '../schemas/testimonialSchema.js';
import { categorySchema } from "../schemas/categorySchema.js";
import { gallerySchema } from "../schemas/gallerySchema.js";
import { blogSchema } from "../schemas/blogSchema.js";
import { newsletterSchema } from '../schemas/newsletterSchema.js';
import ErrorResponse from "../utils/ErrorResponse.js";

export const validateUser = (req, res, next) => {
  const { error } = userSchema.POST.validate(req.body);
  if (error) return next(new ErrorResponse(error, 400));
  next();
};

export const validateRequest = (req, res, next) => {
  const {
    params: { model },
    method,
  } = req;
  let schema;

  switch (model) {
    case "users":
      schema = userSchema[method];
      break;

    case "events":
      schema = eventSchema[method];
      break;

    case "locations":
      schema = locationSchema[method];
      break;

    case "images":
      schema = imageSchema[method];
      break;

    case "categorys":
      schema = categorySchema[method];
      break;

    case "testimonials":
      schema = testimonialSchema[method];
      break;

    case "gallerys":
      schema = gallerySchema[method];
      break;

    case "blogs":
      schema = blogSchema[method];
      break;

    case "newsletters":
      schema = newsletterSchema[method];
      break;

    default:
      return next(new ErrorResponse("Invalid model specified", 404));
  }

  const { error } = schema?.validate(req.body);
  if (error) return next(new ErrorResponse(error, 400));
  next();
};