const { MongoClient } = require('mongodb');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server-global');
const bcrypt = require('bcrypt');
const { UserService, UserErrors, User } = require('../models/UserService');
const express = require('express');
const logger = require('winston');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');
const Joi = require('joi');

describe('Testing User Service Methods', () => {
  let userService;
  let mongoClient;
  let mongoServer;
  let mockUser;
  let request;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    mongoClient = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await mongoClient.connect();

    userService = new UserService(mongoClient);
    
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use(
      session({
        secret: 'test_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
        },
      })
    );

    app.use(
      morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      })
    );

    app.use(async (req, res, next) => {
      req.client = mongoClient;
      req.User = userService;
      next();
    });

    const authRoutes = require('../Routes/authRoute')(userService);
    const userRoutes = require('../Routes/userRoute')(userService);
    app.use('/auth', authRoutes);
    app.use('/user', userRoutes);

    app.use((err, req, res, next) => {
      logger.error(err.stack);
      res.status(500).send('Something broke!');
    });

    request = () => supertest(app);

    mockUser = {
      _id: 'someId648389201c543856ee90d66',
      firstName: 'Sam',
      lastName: 'Chatterley',
      email: 'sam@badgefinder.co.uk',
      membershipNumber: '741485',
      badges: [],
      earned_badges: [],
      password: 'N3p@Qj7e',
      required_badges: [],
      username: 'samchatterley',
    };

    mockBadge = {
      _id: "64527a53b431de7e0e8b1a1e",
      badge_name: "Activity Centre Service ",
      badge_id: 1,
      imageUrl: "https://res.cloudinary.com/dqfvzo7jo/image/upload/activity-sc-activitycenterservice_fw6nnd.jpg",
      categories: "Activity Badges, At Camp, Community Impact"
    };

    mockBadgeRequirement = {
      _id: "643fcd86eee6843daca02b1c",
      requirement_id: 4,
      badge_id: 1,
      requirement_string: "The use of computers in campsite management"
    };

    User.findUserByQuery = jest.fn(() => Promise.resolve(mockUser));
    User.findOne = jest.fn(() => Promise.resolve(mockUser));
    User.findById = jest.fn(() => Promise.resolve(mockUser));
    User.findByEmail = jest.fn(() => Promise.resolve(mockUser));
    User.create = jest.fn(() => Promise.resolve(mockUser._id));
    User.update = jest.fn(() => Promise.resolve({ firstName: 'Jane' }));
    User.findOneAndUpdate = jest.fn(() => Promise.resolve(mockUser));
    User.deleteById = jest.fn(() => Promise.resolve({ deletedCount: 1 }));
    User.findOneAndUpdateWithOperations = jest.fn(() => Promise.resolve(mockUser));
    User.registerUser = jest.fn(() => Promise.resolve(mockUser));
    User.registerSecondaryUser = jest.fn(() => Promise.resolve(mockUser));
    User.authenticateUser = jest.fn(() => Promise.resolve(mockUser));
    User.addBadge = jest.fn(() => Promise.resolve(mockUser));
    User.removeBadge = jest.fn(() => Promise.resolve(mockUser));
    User.updateBadgeRequirement = jest.fn(() => Promise.resolve(mockUser));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoServer.stop();
  });

  describe('UserService Method Tests', () => {
    it('createUserObject - Should create a new user object', () => {
      const userObject = userService.createUserObject(mockUser);
  
      expect(userObject).toBeInstanceOf(User);
      expect(userObject).toMatchObject(mockUser);
    });

    it('findUserByQuery - Should find a user by query', () => {
      const query = { firstName: 'Sam' };
      const user = userService.findUserByQuery(query);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('findOne - Should find a user by id', () => {
      const user = userService.findOne(mockUser._id);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('findById - Should find a user by id', () => {
      const user = userService.findById(mockUser._id);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('findByEmail - Should find a user by email', () => {
      const user = userService.findByEmail(mockUser.email);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('create - Should create a new user', () => {
      const user = userService.create(mockUser);

      expect(user).resolves.toBe(mockUser._id);
    });

    it('update - Should update a user', () => {
      const user = userService.update(mockUser._id, { firstName: 'Jane' });

      expect(user).resolves.toMatchObject({ firstName: 'Jane' });
    });

    it('findOneAndUpdate - Should find and update a user', () => {
      const user = userService.findOneAndUpdate(mockUser._id, { firstName: 'Jane' });

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('deleteById - Should delete a user by id', () => {
      const user = userService.deleteById(mockUser._id);

      expect(user).resolves.toMatchObject({ deletedCount: 1 });
    });

    it('findOneAndUpdateWithOperations - Should find and update a user with operations', () => {
      const operations = { $set: { firstName: 'Jane' } };
      const user = userService.findOneAndUpdateWithOperations(mockUser._id, operations);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('registerUser - Should register a new user', () => {
      const user = userService.registerUser(mockUser);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('registerSecondaryUser - Should register a new secondary user', () => {
      const user = userService.registerSecondaryUser(mockUser);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('authenticateUser - Should authenticate a user', () => {
      const user = userService.authenticateUser(mockUser);

      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toMatchObject(mockUser);
    });

    it('addBadge - Should add a badge to a user', () => {
      const updatedUser = { ...mockUser, badges: [mockBadge._id] };
      User.addBadge.mockReturnValueOnce(Promise.resolve(updatedUser));
    
      const user = userService.addBadge(mockUser._id, mockBadge);
    
      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toHaveProperty('badges', [mockBadge._id]);
    });
    
    it('removeBadge - Should remove a badge from a user', () => {
      const updatedUser = { ...mockUser };
      User.removeBadge.mockReturnValueOnce(Promise.resolve(updatedUser));
    
      const user = userService.removeBadge(mockUser._id, mockBadge);
    
      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toHaveProperty('badges', []);
    });
    
    it('updateBadgeRequirement - Should update a badge requirement for a user', () => {
      const updatedUser = { ...mockUser, required_badges: [mockBadgeRequirement._id] };
      User.updateBadgeRequirement.mockReturnValueOnce(Promise.resolve(updatedUser));
    
      const user = userService.updateBadgeRequirement(mockUser._id, mockBadge);
    
      expect(user).resolves.toBeInstanceOf(User);
      expect(user).resolves.toHaveProperty('required_badges', [mockBadgeRequirement._id]);
    });
  });
});