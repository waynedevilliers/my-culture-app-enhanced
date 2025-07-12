import ErrorResponse from '../utils/ErrorResponse.js';

export const authorize =  (req, res, next) => {
  if (!req.user || req.user.role !== "admin") throw new ErrorResponse("Forbidden, insufficient permissions.", 403);
  next();
}