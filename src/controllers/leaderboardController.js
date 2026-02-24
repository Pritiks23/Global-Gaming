const LeaderboardService = require('../services/leaderboardService');

const leaderboardService = new LeaderboardService();

const submitScore = async (req, res, next) => {
  try {
    const { userId, gameName, score } = req.body;
    
    const result = await leaderboardService.submitScore(userId, gameName, score);
    
    res.status(200).json({
      message: 'Score updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getTopUsers = async (req, res, next) => {
  try {
    const count = parseInt(req.params.count);
    
    const users = await leaderboardService.getTopUsers(count);
    
    res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

const getUserContext = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const context = await leaderboardService.getUserContext(userId);
    
    if (!context) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.status(200).json(context);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await leaderboardService.getStats();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitScore,
  getTopUsers,
  getUserContext,
  getStats
};
