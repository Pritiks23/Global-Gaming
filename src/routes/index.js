const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { validateSubmitScore, validateTopCount, validateUserId } = require('../middleware/validator');

// Submit score endpoint
router.post('/scores', validateSubmitScore, leaderboardController.submitScore);

// Get top X users endpoint
router.get('/leaderboard/top/:count', validateTopCount, leaderboardController.getTopUsers);

// Get user context endpoint
router.get('/leaderboard/user/:userId', validateUserId, leaderboardController.getUserContext);

// Get stats endpoint
router.get('/stats', leaderboardController.getStats);

module.exports = router;
