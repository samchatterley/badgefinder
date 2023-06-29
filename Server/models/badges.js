const mongoose = require('mongoose');
const logger = require('../../logger');
const { Schema } = mongoose;

const badgeSchema = new Schema({
  badge_name: { type: String, required: true },
  badge_id: { type: Number, required: true }
});
logger.info('Created badge schema');

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;