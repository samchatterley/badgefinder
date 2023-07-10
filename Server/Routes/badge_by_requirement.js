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
    logger.info('Request received for badge search by requirement');
    await client.connect();
    const db = client.db('BadgeFinder');
    const badges = db.collection('Badges');
    const requirements = db.collection('Requirements');

    const query = req.query.query;

    logger.info('Searching for badges with requirement: ', query);

    const matchingRequirements = await requirements.find({
      requirement_string: { $regex: `.*${query}.*`, $options: 'i' }
    }).toArray();

    const matchingBadgeIds = new Set(matchingRequirements.map((r) => r.badge_id));

    const matchingBadges = await badges.find({ ID: { $in: Array.from(matchingBadgeIds) } }).toArray();

    logger.info('Found matching badges:', matchingBadges);

    res.status(200).json(matchingBadges);
  } catch (err) {
    logger.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;