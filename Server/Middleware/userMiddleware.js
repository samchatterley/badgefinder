require('dotenv').config();
const UserErrors = require('../models/UserErrors');
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const logger = require('../../logger');

// Middleware to log the request
const logRequestStart = (req, res, next) => {
    logger.info(`Received ${req.method} request for ${req.originalUrl}`);
    next();
};

// Middleware to authenticate the user
const authenticate = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_SECRET);
            const user = await req.userInstance.findById(decodedToken.id);
            if (!user) throw new UserErrors.UserNotFoundError(`User with id ${decodedToken.id} not found`);
            
            // Save the user in req.user, so it can be accessed later in the route handlers
            req.user = user;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next(new UserErrors.AuthenticationError('Not authenticated'));
    }
};

// Error-handling middleware
const errorHandlingMiddleware = (err, req, res, next) => {
    const errorTypeMapping = {
        AuthenticationError: 401,
        UserNotFoundError: 404,
        BadgeNotFoundError: 404,
        InvalidBadgeIdError: 400,
        DoesNotHaveBadgeError: 400,
        InvalidCompletionStatusError: 400,
        RequirementNotFoundError: 404,
        UserError: 400,
        ValidationError: 400
    };

    const statusCode = errorTypeMapping[err.constructor.name] || 500;
    res.status(statusCode).json({
        error: err.message
    });
};

module.exports = { logRequestStart, authenticate, errorHandlingMiddleware };
