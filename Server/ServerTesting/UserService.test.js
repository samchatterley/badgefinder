const { MongoClient, ObjectId } = require('mongodb');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server-global');
const bcrypt = require('bcrypt');
const UserClass = require('../models/UserClass');
const { UserService } = require('../models/UserService');
const request = supertest;

describe('Testing User Methods and Routes', () => {
  let mockUserClass;
  let mockUserService;
  let mongoServer;
  let mongoClient;
  let app;
  let mockUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    mongoClient = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await mongoClient.connect();

    mockUserClass = new UserClass(mongoClient);
    mockUserService = new UserService(mockUserClass);

    const userId = new ObjectId();
    mockUser = new UserClass({
      _id: userId,
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      membershipNumber: '1234567890',
      badges: [],
      earned_badges: [],
      password: 'password1',
      required_badges: [],
      username: 'testuser'
    });

    jest.spyOn(mockUserService, 'findOne');
    jest.spyOn(mockUserService, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(mockUserService, 'create');
    jest.spyOn(mockUserService, 'update');
    jest.spyOn(mockUserService, 'findOneAndUpdate');
    jest.spyOn(mockUserService, 'findOneAndUpdateWithOperations');
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');

    mockUserClass.badgesCollection = {
      findOne: jest.fn(),
    };
    mockUserClass.requirementsCollection = {
      find: jest.fn(),
    };

    const userRoutes = require('../Routes/userRoute')(mockUserService);
    const express = require('express');
    app = express();
    app.use('/user', userRoutes);
  });

  afterAll(async () => {
    await mongoClient.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with a user for GET /user/:id', async () => {
    const res = await request(app)
      .get(`/user/${mockUser.getId()}`)
      .expect(200);

    expect(res.body).toEqual({
      _id: mockUser.getId().toString(),
      firstName: mockUser.getFirstName(),
      lastName: mockUser.getLastName(),
      email: mockUser.getEmail(),
      membershipNumber: mockUser.getMembershipNumber(),
      badges: mockUser.badges,
      earned_badges: mockUser.getEarnedBadges(),
      password: mockUser.getPassword(),
      required_badges: mockUser.getRequiredBadges(),
      username: mockUser.getUsername()
    });
  });
});
