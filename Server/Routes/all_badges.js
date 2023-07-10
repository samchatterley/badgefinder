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
    await client.connect();
    const db = client.db('BadgeFinder');
    const collection = db.collection('Badges');
    const result = await collection.find({}).toArray();

    res.send(result);
  } catch (err) {
    logger.info(err);
    res.status(500).send('Error retrieving badges');
  } finally {
    await client.close();
  }
});

module.exports = router;