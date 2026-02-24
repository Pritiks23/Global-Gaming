const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  gameName: {
    type: String,
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
scoreSchema.index({ userId: 1, gameName: 1 }, { unique: true });

const userScoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalScore: {
    type: Number,
    default: 0,
    index: true // Index for leaderboard sorting
  },
  games: {
    type: Map,
    of: Number,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a descending index on totalScore for efficient leaderboard queries
userScoreSchema.index({ totalScore: -1 });

const Score = mongoose.model('Score', scoreSchema);
const UserScore = mongoose.model('UserScore', userScoreSchema);

module.exports = { Score, UserScore };
