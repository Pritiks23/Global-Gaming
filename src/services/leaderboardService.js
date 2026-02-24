const { UserScore } = require('../models/Score');
const RedisService = require('./redisService');

class LeaderboardService {
  constructor() {
    this.redisService = new RedisService();
  }

  /**
   * Submit or update a score for a user in a specific game
   */
  async submitScore(userId, gameName, score) {
    try {
      // Find or create user score document
      let userScore = await UserScore.findOne({ userId });
      
      if (!userScore) {
        userScore = new UserScore({
          userId,
          games: new Map([[gameName, score]]),
          totalScore: score
        });
      } else {
        // Update the game score
        userScore.games.set(gameName, score);
        
        // Recalculate total score
        let total = 0;
        for (const [, gameScore] of userScore.games) {
          total += gameScore;
        }
        userScore.totalScore = total;
        userScore.lastUpdated = new Date();
      }
      
      await userScore.save();
      
      // Invalidate cache after score update
      await this.redisService.invalidateLeaderboardCache();
      
      // Get updated rank
      const rank = await this.getUserRank(userId);
      
      return {
        userId,
        gameName,
        score,
        totalScore: userScore.totalScore,
        currentRank: rank
      };
    } catch (error) {
      throw new Error(`Failed to submit score: ${error.message}`);
    }
  }

  /**
   * Get top X users from leaderboard
   */
  async getTopUsers(count) {
    try {
      // Try to get from cache first
      const cacheKey = `leaderboard:top:${count}`;
      const cached = await this.redisService.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Query database
      const topUsers = await UserScore
        .find()
        .sort({ totalScore: -1 })
        .limit(count)
        .lean();
      
      // Transform to include rank
      const rankedUsers = topUsers.map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        totalScore: user.totalScore,
        games: Object.fromEntries(user.games || new Map())
      }));
      
      // Cache the result
      await this.redisService.set(cacheKey, JSON.stringify(rankedUsers), 60); // Cache for 1 minute
      
      return rankedUsers;
    } catch (error) {
      throw new Error(`Failed to get top users: ${error.message}`);
    }
  }

  /**
   * Get user's rank in the leaderboard
   */
  async getUserRank(userId) {
    try {
      const userScore = await UserScore.findOne({ userId });
      if (!userScore) return null;
      
      // Count users with higher scores
      const rank = await UserScore.countDocuments({
        totalScore: { $gt: userScore.totalScore }
      });
      
      return rank + 1; // 1-indexed
    } catch (error) {
      throw new Error(`Failed to get user rank: ${error.message}`);
    }
  }

  /**
   * Get user context (user's rank and surrounding users)
   */
  async getUserContext(userId) {
    try {
      const userScore = await UserScore.findOne({ userId });
      if (!userScore) {
        return null;
      }
      
      const rank = await this.getUserRank(userId);
      
      // Get user above (higher score)
      const userAbove = await UserScore
        .findOne({ totalScore: { $gt: userScore.totalScore } })
        .sort({ totalScore: 1 })
        .lean();
      
      // Get user below (lower score)
      const userBelow = await UserScore
        .findOne({ totalScore: { $lt: userScore.totalScore } })
        .sort({ totalScore: -1 })
        .lean();
      
      const formatUser = (user, userRank) => user ? {
        rank: userRank,
        userId: user.userId,
        totalScore: user.totalScore,
        games: Object.fromEntries(user.games || new Map())
      } : null;
      
      return {
        userAbove: formatUser(userAbove, rank - 1),
        currentUser: {
          rank,
          userId: userScore.userId,
          totalScore: userScore.totalScore,
          games: Object.fromEntries(userScore.games || new Map())
        },
        userBelow: formatUser(userBelow, rank + 1)
      };
    } catch (error) {
      throw new Error(`Failed to get user context: ${error.message}`);
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getStats() {
    try {
      const totalUsers = await UserScore.countDocuments();
      const topUser = await UserScore.findOne().sort({ totalScore: -1 }).lean();
      
      return {
        totalUsers,
        topScore: topUser ? topUser.totalScore : 0,
        topUser: topUser ? topUser.userId : null
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = LeaderboardService;
