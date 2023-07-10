const {
    InvalidBadgesError,
    InvalidFirstNameError,
    InvalidLastNameError,
    InvalidEmailError,
    InvalidMembershipNumberError,
    InvalidUsernameError,
    InvalidEarnedBadgesError,
    InvalidRequiredBadgesError,
    InvalidPasswordError,
} = require("./UserErrors");

class User {
    constructor({
        _id,
        firstName,
        lastName,
        email,
        membershipNumber,
        badges,
        earned_badges,
        password,
        required_badges,
        username
    }) {
        this._id = _id;
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
        this._membershipNumber = membershipNumber;
        this._badges = badges;
        this._earned_badges = earned_badges;
        this._password = password;
        this._required_badges = required_badges;
        this._username = username;
    }

    getFirstName() {
        return this._firstName;
    }

    getLastName() {
        return this._lastName;
    }

    getFullName() {
        return `${this._firstName} ${this._lastName}`;
    }

    getEmail() {
        return this._email;
    }

    getId() {
        return this._id;
    }

    getMembershipNumber() {
        return this._membershipNumber;
    }

    getBadges() {
        return this._badges;
    }

    getEarnedBadges() {
        return this._earned_badges;
    }

    getRequiredBadges() {
        return this._required_badges;
    }

    getUsername() {
        return this._username;
    }

    getPassword() {
        return this._password;
    }

    set firstName(name) {
        if (!name || typeof name !== 'string') {
            throw new InvalidFirstNameError();
        }
        this._firstName = name;
    }

    set lastName(name) {
        if (!name || typeof name !== 'string') {
            throw new InvalidLastNameError();
        }
        this._lastName = name;
    }

    set email(email) {
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{1,7}$/;
        if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
            throw new InvalidEmailError();
        }
        this._email = email;
    }

    set membershipNumber(number) {
        if (!number || typeof number !== 'string') {
            throw new InvalidMembershipNumberError();
        }
        this._membershipNumber = number;
    }

    set username(username) {
        if (!username || typeof username !== 'string') {
            throw new InvalidUsernameError();
        }
        this._username = username;
    }

    set badges(badges) {
        if (!Array.isArray(badges)) {
            throw new InvalidBadgesError();
        }
        this._badges = badges;
    }

    set earned_badges(badges) {
        if (!Array.isArray(badges)) {
            throw new InvalidEarnedBadgesError();
        }
        this._earned_badges = badges;
    }

    set required_badges(badges) {
        if (!Array.isArray(badges)) {
            throw new InvalidRequiredBadgesError();
        }
        this._required_badges = badges;
    }

    set password(password) {
        const passwordRegex = /^(?=.*\d)/;
        if (!password || typeof password !== 'string' || password.length < 8 || !passwordRegex.test(password)) {
            throw new InvalidPasswordError();
        }
        this._password = password;
    }
    

}

module.exports = User;