const mongoose = require('mongoose');
const logger = require('../../logger');

const { Schema } = mongoose;

const requirementSchema = new Schema({
  badge_id: { type: Number, required: true },
  requirement_id: { type: Number, required: true },
  requirement_string: { type: String, required: true }
});
logger.info('Created requirement schema');

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement;