const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { validateSubmitScore, validateTopCount, validateUserId } = require('../middleware/validator');

/**
 * @swagger
 * /scores:
 *   post:
 *     summary: Submit or update a score for a user in a specific game
 *     tags: [Scores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - gameName
 *               - score
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Unique identifier for the user
 *                 example: player123
 *               gameName:
 *                 type: string
 *                 description: Name of the game
 *                 example: space-invaders
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 description: Score achieved (must be >= 0)
 *                 example: 1500
 *     responses:
 *       200:
 *         description: Score updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     gameName:
 *                       type: string
 *                     score:
 *                       type: number
 *                     totalScore:
 *                       type: number
 *                     currentRank:
 *                       type: number
 *       400:
 *         description: Invalid input
 */
router.post('/scores', validateSubmitScore, leaderboardController.submitScore);

/**
 * @swagger
 * /leaderboard/top/{count}:
 *   get:
 *     summary: Get top X users sorted by total score
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of top users to retrieve (1-1000)
 *         example: 10
 *     responses:
 *       200:
 *         description: List of top users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                       userId:
 *                         type: string
 *                       totalScore:
 *                         type: number
 *                       games:
 *                         type: object
 *                         additionalProperties:
 *                           type: number
 */
router.get('/leaderboard/top/:count', validateTopCount, leaderboardController.getTopUsers);

/**
 * @swagger
 * /leaderboard/user/{userId}:
 *   get:
 *     summary: Get user's rank and surrounding users
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to look up
 *         example: player123
 *     responses:
 *       200:
 *         description: User context with rank and surrounding users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userAbove:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     rank:
 *                       type: integer
 *                     userId:
 *                       type: string
 *                     totalScore:
 *                       type: number
 *                     games:
 *                       type: object
 *                 currentUser:
 *                   type: object
 *                   properties:
 *                     rank:
 *                       type: integer
 *                     userId:
 *                       type: string
 *                     totalScore:
 *                       type: number
 *                     games:
 *                       type: object
 *                 userBelow:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     rank:
 *                       type: integer
 *                     userId:
 *                       type: string
 *                     totalScore:
 *                       type: number
 *                     games:
 *                       type: object
 *       404:
 *         description: User not found
 */
router.get('/leaderboard/user/:userId', validateUserId, leaderboardController.getUserContext);

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get leaderboard statistics
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Leaderboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalScores:
 *                   type: integer
 *                 totalGames:
 *                   type: integer
 */
router.get('/stats', leaderboardController.getStats);

module.exports = router;
