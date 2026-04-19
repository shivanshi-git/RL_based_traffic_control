const mongoose = require("mongoose");

const TrafficSchema = new mongoose.Schema({
  state: [Number],
  action: Number,
  reward: Number,
  type: String, // "RL" or "FIXED"
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Traffic", TrafficSchema);