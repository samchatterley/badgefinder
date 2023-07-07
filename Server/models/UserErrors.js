const User = require("./UserClass");

class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class UserNotFoundError extends UserError {}
class BadgeNotFoundError extends UserError {}
class AlreadyHasBadgeError extends UserError {}
class DoesNotHaveBadgeError extends UserError {}
class RequirementNotFoundError extends UserError {}

class InvalidFirstNameError extends UserError {
    constructor() {
        super('firstName must be a non-empty string');
        this.name = this.constructor.name;
    }
}

class InvalidLastNameError extends UserError {
    constructor() {
        super('lastName must be a non-empty string');
        this.name = this.constructor.name;
    }
}

class InvalidEmailError extends UserError {
    constructor() {
        super('email must be a valid email address');
        this.name = this.constructor.name;
    }
}

class InvalidMembershipNumberError extends UserError {
    constructor() {
        super('membershipNumber must be a non-empty string');
        this.name = this.constructor.name;
    }
}

class InvalidUsernameError extends UserError {
    constructor() {
        super('username must be a non-empty string');
        this.name = this.constructor.name;
    }
}

class InvalidBadgesError extends UserError {
    constructor() {
        super('badges must be an array');
        this.name = this.constructor.name;
    }
}

class InvalidEarnedBadgesError extends UserError {
    constructor() {
        super('earned_badges must be an array');
        this.name = this.constructor.name;
    }
}

class InvalidRequiredBadgesError extends UserError {
    constructor() {
        super('required_badges must be an array');
        this.name = this.constructor.name;
    }
}

class InvalidPasswordError extends UserError {
    constructor() {
        super('password must be a string of at least 8 characters');
        this.name = this.constructor.name;
    }
}

class DuplicateUsernameError extends Error {
    constructor(message = 'username already exists') {
        super(message);
        this.name = 'DuplicateUsernameError';
    }
}

module.exports = {
    UserError,
    UserNotFoundError,
    BadgeNotFoundError,
    AlreadyHasBadgeError,
    DoesNotHaveBadgeError,
    RequirementNotFoundError,
    InvalidBadgesError,
    InvalidFirstNameError,
    InvalidLastNameError,
    InvalidEmailError,
    InvalidMembershipNumberError,
    InvalidUsernameError,
    InvalidEarnedBadgesError,
    InvalidRequiredBadgesError,
    InvalidPasswordError,
    DuplicateUsernameError
};