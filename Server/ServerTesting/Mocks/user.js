const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const mockUserInstance = jest.fn().mockImplementation(() => ({
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOneAndUpdate: jest.fn(),
    registerUser: jest.fn(),
    registerSecondaryUser: jest.fn(),
    authenticateUser: jest.fn(),
    addBadge: jest.fn(),
    removeBadge: jest.fn(),
}));

module.exports = mockUserInstance;
