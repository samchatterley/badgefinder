const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const User = require('./UserClass');
const logger = require('../../logger');

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

class UserService {
  constructor(client) {
      this.client = client;
      this.usersDb = client.db("BadgeFinderUsers");
      this.badgesDb = client.db("BadgeFinder");
      this.usersCollection = this.usersDb.collection("Users");
      this.badgesCollection = this.badgesDb.collection("Badges");
      this.requirementsCollection = this.badgesDb.collection("Requirements");
  }

  async findOne(query) {
      logger.info(`Searching for user with query ${JSON.stringify(query)}`);
      const user = await this.usersCollection.findOne(query);
      logger.info(`Found user with query ${JSON.stringify(query)}`);
      return new User({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          membershipNumber: user.membershipNumber,
          badges: user.badges,
          earned_badges: user.earned_badges,
          required_badges: user.required_badges,
          username: user.username
      });
  }

  async findById(id) {
      logger.info(`Searching for user with id ${id}`);
      try {
          const user = await this.usersCollection.findOne({
              _id: new ObjectId(id)
          });
          if (!user) {
              throw new UserNotFoundError('User not found');
          }
          logger.info(`Found user with id ${id}`);
          return new User({
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              membershipNumber: user.membershipNumber,
              badges: user.badges,
              earned_badges: user.earned_badges,
              required_badges: user.required_badges,
              username: user.username
          });
      } catch (error) {
          logger.error(`Error occurred while finding user with id ${id}, ${error}`);
          throw error;
      }
  }

  async create(data) {
      if (!data.firstName || !data.lastName || !data.email || !data.membershipNumber) {
          throw new UserError("Required fields are missing");
      }
      try {
          const result = await this.usersCollection.insertOne(data);
          return result.insertedId;
      } catch (err) {
          logger.error(`Error occurred while creating user, ${err}`);
          throw new UserError("Error occurred while creating user");
      }
  }

  async update(query, updateData) {
      try {
          await this.usersCollection.updateOne(query, {
              $set: updateData
          });
      } catch (err) {
          throw err;
      }
  }

  async findOneAndUpdate(query, updateData) {
      const options = {
          returnOriginal: false,
          new: true
      };
      logger.info(`Searching for user with id ${query._id}`);
      const result = await this.usersCollection.findOneAndUpdate(query, {
          $set: updateData
      }, options);
      logger.info(`Found and updated user with id ${query._id}`);
      return new User({
          _id: result.value._id,
          firstName: result.value.firstName,
          lastName: result.value.lastName,
          email: result.value.email,
          membershipNumber: result.value.membershipNumber,
          badges: result.value.badges,
          earned_badges: result.value.earned_badges,
          required_badges: result.value.required_badges,
          username: result.value.username,
      });
  }

  async deleteById(_id) {
      logger.info(`Deleting user with id ${id}`);
      try {
          const result = await this.usersCollection.deleteOne({
              _id: new ObjectId(id)
          });
          if (result.deletedCount === 0) {
              throw new UserNotFoundError('User not found');
          }
          logger.info(`Deleted user with id ${id}`);
      } catch (error) {
          logger.error(`Error occurred while deleting user with id ${id}, ${error}`);
          throw error;
      }
  }

  async findOneAndUpdateWithOperations(query, operations, options) {
      try {
          const result = await this.usersCollection.findOneAndUpdate(query, operations, options);
          logger.info(`Found and updated user with id ${query._id}`);
          return result;
      } catch (err) {
          logger.error(`Error occurred while updating user, ${err}`);
          throw err;
      }
  }

  async registerUser({
      firstName,
      lastName,
      email,
      membershipNumber
  }) {
      logger.info(`Creating user with data ${JSON.stringify({ firstName, lastName, email, membershipNumber })}`);
      const newUser = await this.create({
          firstName,
          lastName,
          email,
          membershipNumber,
          badges: []
      });
      logger.info(`Created user with id ${newUser}`);
      return this.findById(newUser);
  }

  async registerSecondaryUser({
      _id,
      username,
      password,
      earned_badges,
      required_badges
  }) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const updatedUser = await this.findOneAndUpdate({
          _id: new ObjectId(_id)
      }, {
          username,
          password: hashedPassword,
          earned_badges,
          required_badges
      });
      if (!updatedUser.value) {
          throw new UserNotFoundError('User not found');
      }
      delete updatedUser.value.password; // Delete the password field
      return updatedUser;
  }

  async authenticateUser({
      username,
      password
  }) {
      const user = await this.findOne({
          username
      });
      if (!user) {
          throw new Error("User not found");
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
          throw new Error("Invalid password");
      }
      delete user.password;
      return user;
  }

  async addBadge(userId, badgeId) {
      const user = await this.findById(userId);
      if (user.earned_badges && user.earned_badges.find(badge => badge.badge_id === badgeId)) {
          return Promise.reject(new AlreadyHasBadgeError('User already has this badge'));
      }

      const badge = await this.badgesCollection.findOne({
          badge_id: badgeId
      });
      if (!badge) {
          throw new BadgeNotFoundError('Badge not found');
      }

      const requirements = await this.requirementsCollection.find({
          badge_id: badgeId
      }).toArray();

      const newBadge = {
          badge_id: badgeId,
          requirements: requirements.map(requirement => ({
              requirement_id: requirement.requirement_id,
              requirement_string: requirement.requirement_string,
              completed: false,
          })),
      };

      const query = {
          _id: new ObjectId(userId)
      };
      const updateData = {
          $push: {
              earned_badges: newBadge
          }
      };
      const updatedUser = await this.findOneAndUpdate(query, updateData);
      return updatedUser.value;
  }

  async removeBadge(userId, badgeId) {
      const user = await this.findById(userId);
      if (!user.earned_badges.find(badge => badge.badge_id === badgeId)) {
          throw new DoesNotHaveBadgeError('User does not have this badge');
      }

      const query = {
          _id: new ObjectId(userId)
      };
      const updateData = {
          $pull: {
              earned_badges: {
                  badge_id: badgeId
              }
          }
      };
      const updatedUser = await this.findOneAndUpdate(query, updateData);
      return updatedUser.value;
  }

  async updateBadgeRequirement(userId, badgeId, requirementId, completed) {
      logger.info(`Updating badge requirement with badgeId ${badgeId} and requirementId ${requirementId} for user with id ${userId} to ${completed}`);
      const user = await this.findById(userId);
      logger.info(`Found user with id ${userId}`);
      if (!user) {
          logger.error(`User with id ${userId} not found`);
          throw new UserNotFoundError('User not found');
      }
      const badge = user.earned_badges.find(badge => badge.badge_id === badgeId);
      if (!badge) {
          throw new BadgeNotFoundError('Badge not found');
      }
      if (!badge.requirements) {
          throw new RequirementNotFoundError('No requirements for badge');
      }
      const requirement = badge.requirements.find(requirement => requirement.requirement_id === requirementId);
      if (!requirement) {
          throw new RequirementNotFoundError('Requirement not found');
      }
      const updateOperation = {
          $set: {
              [`badges.$[badge].requirements.$[requirement].completed`]: completed
          }
      };
      logger.info(`Updating badge requirement with badgeId ${badgeId} and requirementId ${requirementId} for user with id ${userId} to ${completed}`);
      const options = {
          arrayFilters: [{
              "badge.badge_id": badgeId
          }, {
              "requirement.requirement_id": requirementId
          }],
          returnOriginal: false
      };
      logger.info(`Updating user with id ${userId}`);
      const updatedUser = await this.findOneAndUpdateWithOperations({
          _id: new ObjectId(userId)
      }, updateOperation, options);
      logger.info(`Updated badge requirement with badgeId ${badgeId} and requirementId ${requirementId} for user with id ${userId} to ${completed}`);
      return updatedUser.value;
  }
}

module.exports = {
    UserService,
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
  };