require ('dotenv').config();
const User = require('../models/UserClass');
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const logger = require('../../logger');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err) {
        logger.info(err.message);
        res.status(401).json({ error: 'Unauthorized' });
      } else {
        logger.info(decodedToken);
        next();
      }
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const setCurrentUser = (req, res, next) => {
  const User = req.User;
  const token = req.cookies.jwt;
  logger.info("Received GET request for user with id:", userId);
  if (token) {
    jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        logger.info(err.message);
        res.locals.user = null;
        next();
      } else {
        logger.info(decodedToken);
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, setCurrentUser };