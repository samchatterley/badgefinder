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
    logger.info('Received GET request for requirements');
    await client.connect();
    const db = client.db('BadgeFinder');
    const collection = db.collection('Requirements');
    const badgeId = req.query.badge_id;
    logger.info('Fetching requirements for badge ID:', badgeId);
    const result = await collection.find({badge_id: parseInt(badgeId)}).toArray();
    logger.info('Requirements:', result);
    res.send(result);
  } catch (err) {
    logger.info('Error:', err);
    res.status(500).send('Error retrieving requirements');
  } finally {
    await client.close();
  }
});

module.exports = router;