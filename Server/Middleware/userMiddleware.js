const {
  UserError,
  UserNotFoundError,
  BadgeNotFoundError,
  AlreadyHasBadgeError,
  DoesNotHaveBadgeError,
  RequirementNotFoundError,
  InvalidFirstNameError,
  InvalidLastNameError,
  InvalidEmailError,
  InvalidMembershipNumberError,
  InvalidUsernameError,
  InvalidEarnedBadgesError,
  InvalidRequiredBadgesError,
  InvalidPasswordError,
  DuplicateUsernameError
} = require('../models/UserService');
const logger = require('../../logger');

const userMiddleware = (err, req, res, next) => {
  if (err instanceof UserNotFoundError) {
      logger.error(err.stack);
      res.status(404).json({
          message: err.message
      });
  } else if (err instanceof BadgeNotFoundError || err instanceof RequirementNotFoundError) {
      logger.error(err.stack);
      res.status(404).json({
          message: err.message
      });
  } else if (err instanceof AlreadyHasBadgeError || err instanceof DoesNotHaveBadgeError) {
      logger.error(err.stack);
      res.status(400).json({
          message: err.message
      });
  } else if (err instanceof InvalidFirstNameError ||
             err instanceof InvalidLastNameError ||
             err instanceof InvalidEmailError ||
             err instanceof InvalidMembershipNumberError ||
             err instanceof InvalidUsernameError ||
             err instanceof InvalidEarnedBadgesError ||
             err instanceof InvalidRequiredBadgesError ||
             err instanceof InvalidPasswordError ||
             err instanceof DuplicateUsernameError) {
      logger.error(err.stack);
      res.status(400).json({
          message: err.message
      });
  } else if (err instanceof UserError) {
      logger.error(err.stack);
      res.status(400).json({
          message: err.message
      });
  } else {
      logger.error(err.stack);
      res.status(500).json({
          message: "Internal server error"
      });
  }
};

module.exports = userMiddleware;