import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/ErrorResponse.js";
import asyncWrapper from '../utils/asyncWrapper.js';

export const authenticate = asyncWrapper( async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return next(new ErrorResponse("Access token required", 401));

    if (!process.env.SECRET) {
        return next(new ErrorResponse("JWT secret not configured", 500));
    }

    try {
        req.user = await jwt.verify(token, process.env.SECRET);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorResponse("Token expired", 401));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new ErrorResponse("Invalid token", 401));
        }
        return next(new ErrorResponse("Token verification failed", 401));
    }
});