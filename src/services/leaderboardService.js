const { UserScore } = require('../models/Score');
const { Op } = require('sequelize');

class LeaderboardService {
  /**
   * Submit or update a score for a user in a specific game
   */
  async submitScore(userId, gameName, score) {
    try {
      // Find or create user score document
      let userScore = await UserScore.findByPk(userId);
      
      if (!userScore) {
        userScore = await UserScore.create({
          userId,
          games: { [gameName]: score },
          totalScore: score
        });
      } else {
        // Update the game score
        const games = userScore.games || {};
        games[gameName] = score;
        
        // Recalculate total score
        let total = 0;
        for (const gameScore of Object.values(games)) {
          total += gameScore;
        }
        
        userScore.games = games;
        userScore.totalScore = total;
        userScore.lastUpdated = new Date();
        await userScore.save();
      }
      
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
      const topUsers = await UserScore.findAll({
        order: [['totalScore', 'DESC']],
        limit: count
      });
      
      // Transform to include rank
      const rankedUsers = topUsers.map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        totalScore: user.totalScore,
        games: user.games || {}
      }));
      
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
      const userScore = await UserScore.findByPk(userId);
      if (!userScore) return null;
      
      // Count users with higher scores
      const rank = await UserScore.count({
        where: {
          totalScore: { [Op.gt]: userScore.totalScore }
        }
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
      const userScore = await UserScore.findByPk(userId);
      if (!userScore) {
        return null;
      }
      
      const rank = await this.getUserRank(userId);
      
      // Get user above (higher score)
      const userAbove = await UserScore.findOne({
        where: {
          totalScore: { [Op.gt]: userScore.totalScore }
        },
        order: [['totalScore', 'ASC']]
      });
      
      // Get user below (lower score)
      const userBelow = await UserScore.findOne({
        where: {
          totalScore: { [Op.lt]: userScore.totalScore }
        },
        order: [['totalScore', 'DESC']]
      });
      
      const formatUser = (user, userRank) => user ? {
        rank: userRank,
        userId: user.userId,
        totalScore: user.totalScore,
        games: user.games || {}
      } : null;
      
      return {
        userAbove: formatUser(userAbove, rank - 1),
        currentUser: {
          rank,
          userId: userScore.userId,
          totalScore: userScore.totalScore,
          games: userScore.games || {}
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
      const totalUsers = await UserScore.count();
      const topUser = await UserScore.findOne({
        order: [['totalScore', 'DESC']]
      });
      
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
