const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const UserErrors = require('../models/UserErrors');

const checkAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      req.user = decodedToken;
    } catch (err) {
    }
  }

  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Not authenticated'
    });
  }

  next();
};

const setCurrentUser = async (req, res, next) => {
  if (req.user) {
    try {
      const user = await req.userService.findById(req.user.id);
      if (!user) throw new UserErrors.UserNotFoundError(`User with id ${req.user.id} not found`);
      
      req.user = user;
    } catch (err) {
      return res.status(500).json({
        message: 'An error occurred while fetching the user data'
      });
    }
  }

  next();
};

module.exports = { checkAuth, requireAuth, setCurrentUser };
