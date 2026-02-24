const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Global Gaming Leaderboard API',
      version: '1.0.0',
      description: 'Scalable REST API for managing global gaming leaderboards with real-time rankings',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Scores',
        description: 'Score submission and management'
      },
      {
        name: 'Leaderboard',
        description: 'Leaderboard queries and rankings'
      },
      {
        name: 'System',
        description: 'System health and statistics'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
