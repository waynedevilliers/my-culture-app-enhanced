import ErrorResponse from "../utils/ErrorResponse.js";

export const pagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return next(new ErrorResponse("Page must be a positive number", 400));
  }

  if (limit < 1 || limit > 100) {
    return next(new ErrorResponse("Limit must be between 1 and 100", 400));
  }

  const offset = (page - 1) * limit;
  res.pagination = { page, limit, offset };
  next();
};