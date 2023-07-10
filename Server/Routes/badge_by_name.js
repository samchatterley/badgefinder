require('dotenv').config();
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const {logger} = require('../../logger');
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });
router.use(limiter); 

router.get('/', async (req, res) => {
  try {
    logger.info('Request received for badge search');
    await client.connect();
    const db = client.db('BadgeFinder');
    const collection = db.collection('Badges');
    const name = req.query.badge;
    logger.info('Searching for badge with name:', name);
    const badge = await collection.findOne({ badge: { $regex: `.*${name}.*` } });
    if (badge) {
      logger.info('Badge found:', badge);
      res.status(200).json(badge);
    } else {
      logger.info('Badge not found');
      res.status(404).send('Badge not found');
    }
  } catch (err) {
    logger.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;