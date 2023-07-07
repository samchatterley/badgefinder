const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const User = require('./UserClass');
const logger = require('../../logger');
const ValidationSchemas = require('./ValidationSchema');
const UserErrors = require('./UserErrors');

class UserService {
    constructor(client) {
        this.client = client;
        this.usersDb = client.db("BadgeFinderUsers");
        this.badgesDb = client.db("BadgeFinder");
        this.usersCollection = this.usersDb.collection("Users");
        this.badgesCollection = this.badgesDb.collection("Badges");
        this.requirementsCollection = this.badgesDb.collection("Requirements");
    }

    createUserObject(user) {
        return new User({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            membershipNumber: user.membershipNumber,
            badges: user.badges,
            earned_badges: user.earned_badges,
            required_badges: user.required_badges,
            username: user.username,
        });
    }

    async findUserByQuery(query, schema) {
        const { error } = schema.validate(query);
        if (error) {
            throw error;
        }
        const user = await this.usersCollection.findOne(query);
        if (!user) {
            throw new UserErrors.UserNotFoundError('User not found');
        }
        return this.createUserObject(user);
    }

    async findOne(query) {
        logger.info(`Searching for user with query ${JSON.stringify(query)}`);
        return this.findUserByQuery(query, ValidationSchemas.findOneSchema);
    }

    async findById(_id) {
        logger.info(`Searching for user with id ${_id}`);
        return this.findUserByQuery({ _id: new ObjectId(_id) }, ValidationSchemas.findByIdSchema);
    }

    async findByEmail(email) {
        logger.info(`Searching for user with email ${email}`);
        return this.findUserByQuery({ email }, ValidationSchemas.findByEmailSchema);
    }

    async create(data) {
        const { error } = ValidationSchemas.createSchema.validate(data);
        if (error) {
            throw error;
        }
        const result = await this.usersCollection.insertOne(data);
        return result.insertedId;
    }

    async update(query, updateData) {
        const { error } = ValidationSchemas.updateSchema.validate({ ...query, ...updateData });
        if (error) {
            throw error;
        }
        const result = await this.usersCollection.updateOne(query, { $set: updateData });
        if (result.matchedCount === 0) {
            throw new UserErrors.UserNotFoundError('User not found');
        }
        if (result.modifiedCount === 0) {
            throw new Error('No changes made to the user');
        }
    }

    async findOneAndUpdate(query, updateData) {
        const { error } = ValidationSchemas.findOneAndUpdateSchema.validate({ ...query, ...updateData });
        if (error) {
            throw error;
        }
        const options = { returnOriginal: false, new: true };
        const result = await this.usersCollection.findOneAndUpdate(query, { $set: updateData }, options);
        return this.createUserObject(result.value);
    }

    async deleteById(_id) {
        const { error } = ValidationSchemas.deleteByIdSchema.validate({ _id });
        if (error) {
            throw error;
        }
        const result = await this.usersCollection.deleteOne({ _id: new ObjectId(_id) });
        if (result.deletedCount === 0) {
            throw new UserErrors.UserNotFoundError('User not found');
        }
    }

    async findOneAndUpdateWithOperations(query, operations, options) {
        const { error } = ValidationSchemas.findOneAndUpdateWithOperationsSchema.validate({ _id: query._id, operations });
        if (error) {
            throw error;
        }
        const result = await this.usersCollection.findOneAndUpdate(query, operations, options);
        return this.createUserObject(result.value);
    }

    async registerUser({ firstName, lastName, email, membershipNumber }) {
        const { error } = ValidationSchemas.registerUserSchema.validate({ firstName, lastName, email, membershipNumber });
        if (error) {
            throw error;
        }
        const newUser = await this.create({ firstName, lastName, email, membershipNumber, badges: [] });
        return this.findById(newUser);
    }

    async registerSecondaryUser({ _id, username, password, earned_badges, required_badges }) {
        const { error } = ValidationSchemas.registerSecondaryUserSchema.validate({ _id, username, password, earned_badges, required_badges });
        if (error) {
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const options = { returnOriginal: false };
        const result = await this.usersCollection.findOneAndUpdate({ _id: new ObjectId(_id) }, {
            $set: {
                username,
                password: hashedPassword,
                earned_badges,
                required_badges
            }
        }, options);
        if (!result.value) {
            throw new UserErrors.UserNotFoundError('User not found');
        }
        return this.createUserObject(result.value);
    }

    async authenticateUser({ username, password }) {
        const { error } = ValidationSchemas.authenticateUserSchema.validate({ username, password });
        if (error) {
            throw error;
        }
        const user = await this.usersCollection.findOne({ username });
        if (!user) {
            throw new UserErrors.UserNotFoundError("User not found");
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new UserErrors.InvalidPasswordError("Invalid password");
        }
        return this.createUserObject(user);
    }

    async addBadge(userId, badgeId) {
        const { error } = ValidationSchemas.addBadgeSchema.validate({ userId, badgeId });
        if (error) {
            throw error;
        }
        const badge = await this.badgesCollection.findOne({ _id: new ObjectId(badgeId) });
        if (!badge) {
            throw new UserErrors.BadgeNotFoundError('Badge not found');
        }
        const user = await this.findOneAndUpdate({ _id: new ObjectId(userId) }, { $addToSet: { badges: badge } });
        if (!user) {
            throw new UserErrors.UserNotFoundError('User not found');
        }
        return this.createUserObject(user);
    }

    async removeBadge(userId, badgeId) {
        const { error } = ValidationSchemas.removeBadgeSchema.validate({ userId, badgeId });
        if (error) {
            throw error;
        }
        const badge = await this.badgesCollection.findOne({ _id: new ObjectId(badgeId) });
        if (!badge) {
            throw new UserErrors.BadgeNotFoundError('Badge not found');
        }
        const user = await this.findOneAndUpdate({ _id: new ObjectId(userId) }, { $pull: { badges: { _id: badgeId } } });
        if (!user) {
            throw new UserErrors.UserNotFoundError('User not found');
        }
        return this.createUserObject(user);
    }

    async updateBadgeRequirement(badgeId, requirementId) {
        const { error } = ValidationSchemas.updateBadgeRequirementSchema.validate({ badgeId, requirementId });
        if (error) {
            throw error;
        }
        const requirement = await this.requirementsCollection.findOne({ _id: new ObjectId(requirementId) });
        if (!requirement) {
            throw new UserErrors.RequirementNotFoundError('Requirement not found');
        }
        const badge = await this.badgesCollection.findOneAndUpdate({ _id: new ObjectId(badgeId) }, { $addToSet: { requirements: requirement } });
        if (!badge.value) {
            throw new UserErrors.BadgeNotFoundError('Badge not found');
        }
        return badge;
    }
}

module.exports = { UserService };