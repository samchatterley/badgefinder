const { InvalidFirstNameError, InvalidLastNameError, InvalidEmailError, InvalidMembershipNumberError, InvalidUsernameError, InvalidEarnedBadgesError, InvalidRequiredBadgesError, InvalidPasswordError } = require("./UserService");

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
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.membershipNumber = membershipNumber;
        this.badges = badges;
        this.earned_badges = earned_badges;
        this.password = password;
        this.required_badges = required_badges;
        this.username = username;
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
        const passwordRegex = /^(?=.*[0-9])/;
        if (!password || typeof password !== 'string' || password.length < 8 || !passwordRegex.test(password)) {
            throw new InvalidPasswordError();
        }
        this._password = password;
    }
    
}

module.exports = User;