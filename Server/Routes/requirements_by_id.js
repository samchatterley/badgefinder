const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const {logger} = require('../../logger');
const uri = 'mongodb+srv://samchatterley:ry1xAwS20Pvnmuq6@atlascluster.thbkv6n.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });

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