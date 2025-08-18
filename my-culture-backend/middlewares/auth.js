import jwt from "jsonwebtoken";
import { User } from "../db.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import asyncWrapper from '../utils/asyncWrapper.js';

/**
 * Authenticate token and attach user to request
 */
export const authenticateToken = asyncWrapper(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return next(new ErrorResponse("Access token required", 401));
    }

    if (!process.env.SECRET) {
        return next(new ErrorResponse("JWT secret not configured", 500));
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        
        // Fetch full user data from database
        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'name', 'email', 'role', 'organizationId', 'emailVerified']
        });

        if (!user) {
            return next(new ErrorResponse("User not found", 401));
        }

        // Attach user to request
        req.user = {
            id: user.id,
            userId: user.id, // For backward compatibility
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            emailVerified: user.emailVerified
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorResponse("Token expired", 401));
        } else if (error.name === 'JsonWebTokenError') {
            return next(new ErrorResponse("Invalid token", 401));
        } else {
            return next(new ErrorResponse("Authentication failed", 401));
        }
    }
});

/**
 * Require specific roles
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse("Authentication required", 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ErrorResponse("Insufficient permissions", 403));
        }

        next();
    };
};

/**
 * Require admin role (organization admin or super admin)
 */
export const requireAdmin = requireRole(['admin', 'superAdmin']);

/**
 * Require super admin role
 */
export const requireSuperAdmin = requireRole(['superAdmin']);

/**
 * Require user to belong to specific organization (for organization admins)
 */
export const requireOrganization = (organizationIdParam = 'organizationId') => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse("Authentication required", 401));
        }

        // Super admins can access any organization
        if (req.user.role === 'superAdmin') {
            return next();
        }

        const requestedOrgId = parseInt(req.params[organizationIdParam]);
        
        // Organization admins can only access their own organization
        if (req.user.role === 'admin') {
            if (req.user.organizationId !== requestedOrgId) {
                return next(new ErrorResponse("Access denied to this organization", 403));
            }
            return next();
        }

        // Regular users have no organization access
        return next(new ErrorResponse("Organization access not permitted", 403));
    };
};

/**
 * Optional authentication - attach user if token provided, but don't require it
 */
export const optionalAuth = asyncWrapper(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token provided, continue without user
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'name', 'email', 'role', 'organizationId', 'emailVerified']
        });

        if (user) {
            req.user = {
                id: user.id,
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                emailVerified: user.emailVerified
            };
        }
    } catch (error) {
        // Token invalid, continue without user
        console.warn('Optional auth failed:', error.message);
    }

    next();
});