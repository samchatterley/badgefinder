const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const {logger} = require('../../logger');

const uri = 'mongodb+srv://samchatterley:ry1xAwS20Pvnmuq6@atlascluster.thbkv6n.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });

router.get('/', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('BadgeFinder');
    const collection = db.collection('Badges');
    const result = await collection.find({}).toArray();

    // Image URLs are already included in the badge objects from the database
    res.send(result);
  } catch (err) {
    logger.info(err);
    res.status(500).send('Error retrieving badges');
  } finally {
    await client.close();
  }
});

module.exports = router;