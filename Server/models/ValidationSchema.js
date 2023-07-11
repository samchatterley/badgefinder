const Joi = require('@hapi/joi');
const {
  BadgeNotFoundError,
  InvalidFirstNameError,
  InvalidLastNameError,
  InvalidEmailError,
  InvalidMembershipNumberError,
  InvalidUsernameError,
  InvalidEarnedBadgesError,
  InvalidRequiredBadgesError,
  InvalidPasswordError,
  UserNotFoundError,
  RequirementNotFoundError,
} = require('./UserErrors');

exports.findOneSchema = Joi.object({
    _id: Joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/).required().error(() => new UserNotFoundError()),
    firstName: Joi.string().required().error(() => new InvalidFirstNameError()),
    lastName: Joi.string().required().error(() => new InvalidLastNameError()),
    email: Joi.string().email().required().error(() => new InvalidEmailError()),
    membershipNumber: Joi.string().required().error(() => new InvalidMembershipNumberError()),
    badges: Joi.array().items(Joi.string().error(() => new BadgeNotFoundError())),
    earned_badges: Joi.array().required().error(() => new InvalidEarnedBadgesError()),
    required_badges: Joi.array().required().error(() => new InvalidRequiredBadgesError()),
    username: Joi.string().required().error(() => new InvalidUsernameError()),
}).unknown(true);

exports.findByIdSchema = Joi.object({
    _id: Joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/).required().error(new UserNotFoundError),
  });

exports.findByEmailSchema = Joi.object({
    email: Joi.string().email().required().error(new InvalidEmailError()),
  });

exports.createSchema = Joi.object({
    firstName: Joi.string().required().error(() => new InvalidFirstNameError()),
    lastName: Joi.string().required().error(() => new InvalidLastNameError()),
    email: Joi.string().email().required().error(() => new InvalidEmailError()),
    membershipNumber: Joi.string().required().error(() => new InvalidMembershipNumberError()),
});  

exports.updateSchema = Joi.object({
    _id: Joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/).error(() => new UserNotFoundError()),
    firstName: Joi.string().error(() => new InvalidFirstNameError()),
    lastName: Joi.string().error(() => new InvalidLastNameError()),
    email: Joi.string().email().error(() => new InvalidEmailError()),
    membershipNumber: Joi.string().error(() => new InvalidMembershipNumberError()),
    badges: Joi.array().items(Joi.string().error(() => new BadgeNotFoundError())),
    earned_badges: Joi.array().items(Joi.string()).error(() => new InvalidEarnedBadgesError()),
    required_badges: Joi.array().items(Joi.string()).error(() => new InvalidRequiredBadgesError()),
    username: Joi.string().error(() => new InvalidUsernameError()),
}).unknown(false);

exports.findOneAndUpdateSchema = Joi.object({
    _id: Joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/).error(() => new UserNotFoundError()),
    firstName: Joi.string().error(() => new InvalidFirstNameError()),
    lastName: Joi.string().error(() => new InvalidLastNameError()),
    email: Joi.string().email().error(() => new InvalidEmailError()),
    membershipNumber: Joi.string().error(() => new InvalidMembershipNumberError()),
    badges: Joi.array().items(Joi.string().error(() => new BadgeNotFoundError())),
    earned_badges: Joi.array().items(Joi.string()).error(() => new InvalidEarnedBadgesError()),
    required_badges: Joi.array().items(Joi.string()).error(() => new InvalidRequiredBadgesError()),
    username: Joi.string().error(() => new InvalidUsernameError()),
}).unknown(false);

exports.deleteByIdSchema = Joi.object({
    _id: Joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/).required().error(() => new UserNotFoundError()),
});

exports.findOneAndUpdateWithOperationsSchema = Joi.object({
    _id: Joi.string().length(24).regex(/^[0-9a-fA-F]{24}$/).error(() => new UserNotFoundError()),
    operations: Joi.object({
        $set: Joi.object().pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.array(), Joi.object())),
        $push: Joi.object().pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.array(), Joi.object())),
        $inc: Joi.object().pattern(Joi.string(), Joi.number()),
        $addToSet: Joi.object().pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.array(), Joi.object())),
        $pull: Joi.object().pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.array(), Joi.object())),
    }).unknown(true),
}).unknown(true);

exports.registerUserSchema = Joi.object({
    firstName: Joi.string().required().error(new InvalidFirstNameError()),
    lastName: Joi.string().required().error(new InvalidLastNameError()),
    email: Joi.string().email().required().error(new InvalidEmailError()),
    membershipNumber: Joi.string().required().error(new InvalidMembershipNumberError()),
  });
  
  exports.registerSecondaryUserSchema = Joi.object({
    _id: Joi.string().required(),
    username: Joi.string().required().error(new InvalidUsernameError()),
    password: Joi.string().min(8).required().error(new InvalidPasswordError()),
    earned_badges: Joi.array().required().error(new InvalidEarnedBadgesError()),
    required_badges: Joi.array().required().error(new InvalidRequiredBadgesError())
  });
  
  exports.authenticateUserSchema = Joi.object({
    username: Joi.string().required().error(new InvalidUsernameError()),
    password: Joi.string().min(8).required().error(new InvalidPasswordError())
  });
  
  exports.addBadgeSchema = Joi.object({
    userId: Joi.string().length(24).required().error(new BadgeNotFoundError()),
    badgeId: Joi.string().length(24).required().error(new BadgeNotFoundError()),
});

exports.removeBadgeSchema = Joi.object({
    userId: Joi.string().length(24).required().error(new BadgeNotFoundError()),
    badgeId: Joi.string().length(24).required().error(new BadgeNotFoundError()),
});

exports.updateBadgeRequirementSchema = Joi.object({
    userId: Joi.string().length(24).required().error(new BadgeNotFoundError()),
    badgeId: Joi.string().length(24).required().error(new BadgeNotFoundError()),
    requirementId: Joi.string().length(24).required().error(new RequirementNotFoundError()),
    completed: Joi.boolean().required(),
});