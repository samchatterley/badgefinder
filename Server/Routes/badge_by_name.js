const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const {logger} = require('../../logger');

const uri = 'mongodb+srv://samchatterley:ry1xAwS20Pvnmuq6@atlascluster.thbkv6n.mongodb.net/test?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });

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