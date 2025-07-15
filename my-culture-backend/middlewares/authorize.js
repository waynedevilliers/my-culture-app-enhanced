import ErrorResponse from '../utils/ErrorResponse.js';

export const authorize =  (req, res, next) => {
  if (!req.user || req.user.role !== "admin") throw new ErrorResponse("Forbidden, insufficient permissions.", 403);
  next();
}

export const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superAdmin") throw new ErrorResponse("Forbidden, super admin permissions required.", 403);
  next();
}

export const authorizeAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superAdmin")) {
    throw new ErrorResponse("Forbidden, admin or super admin permissions required.", 403);
  }
  next();
}