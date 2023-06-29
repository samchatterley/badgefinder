const mockMongoClient = {
    db: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    command: jest.fn().mockResolvedValue({ ok: 1 }),
    connect: jest.fn(),
    close: jest.fn(),
  };
  
  module.exports = {
    MongoClient: jest.fn(() => mockMongoClient),
    ObjectId: jest.fn(),
  };