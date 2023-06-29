const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const {logger} = require('../../logger');

const uri = 'mongodb+srv://samchatterley:ry1xAwS20Pvnmuq6@atlascluster.thbkv6n.mongodb.net/test?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });

router.get('/', async (req, res) => {
  try {
    logger.info('Request received for badge search by category');
    await client.connect();
    const db = client.db('BadgeFinder');
    const collection = db.collection('Badges');
    const category = req.query.categories;
    logger.info('Searching for badges in category:', category);
    const badges = await collection.find({ categories: { $regex: `.*\\b${category}\\b.*`, $options: 'i' } }).toArray();
    if (badges && badges.length > 0) {
      logger.info('Badges found:', badges);
      res.status(200).json(badges);
    } else {
      logger.info('No badges found in this category');
      res.status(404).send('No badges found in this category');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;