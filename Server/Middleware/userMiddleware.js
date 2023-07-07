const { logger } = require('../../logger');

const errorTypeMapping = {
    UserService: 500,
    UserNotFoundError: 404,
    BadgeNotFoundError: 404,
    AlreadyHasBadgeError: 400,
    DoesNotHaveBadgeError: 400,
    RequirementNotFoundError: 404,
    InvalidFirstNameError: 400,
    InvalidLastNameError: 400,
    InvalidEmailError: 400,
    InvalidMembershipNumberError: 400,
    InvalidUsernameError: 400,
    InvalidEarnedBadgesError: 400,
    InvalidRequiredBadgesError: 400,
    InvalidPasswordError: 400,
    DuplicateUsernameError: 409,
    default: 500,
};

const userMiddleware = (req, res, next) => {
    logger.info('In User Middleware');
    next();
};

const errorHandlingMiddleware = (err, req, res, next) => {
    const status = errorTypeMapping[err.name] || errorTypeMapping.default;
    res.status(status).json({
        message: err.message,
    });
};

module.exports = [
    userMiddleware,
    errorHandlingMiddleware
];
