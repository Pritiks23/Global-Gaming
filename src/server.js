const express = require('express');
const sequelize = require('./config/database');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"]
    }
  }
}));
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Global Gaming API Docs'
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Global Gaming Leaderboard API',
    version: '1.0.0',
    description: 'Scalable REST API for managing global gaming leaderboards with real-time rankings',
    documentation: '/api-docs',
    endpoints: {
      'POST /scores': {
        description: 'Submit or update a score for a user in a specific game',
        body: {
          userId: 'string (required)',
          gameName: 'string (required)',
          score: 'number (required, >= 0)'
        }
      },
      'GET /leaderboard/top/:count': {
        description: 'Get top X users sorted by total score',
        params: {
          count: 'number (required, 1-1000)'
        }
      },
      'GET /leaderboard/user/:userId': {
        description: 'Get user\'s rank and surrounding users (above and below)',
        params: {
          userId: 'string (required)'
        }
      },
      'GET /stats': {
        description: 'Get leaderboard statistics'
      },
      'GET /health': {
        description: 'Health check endpoint'
      }
    },
    features: [
      'Real-time score updates',
      'Efficient leaderboard queries with database indexing',
      'File-based SQLite database (zero configuration)',
      'Rate limiting for API protection',
      'Input validation with Joi',
      'Scalable architecture',
      'Persistent data storage'
    ]
  });
});

// API routes
app.use('/', routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Database connection and initialization
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');
    
    // Sync models with database
    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Initialize and start server
const startServer = async () => {
  try {
    // Initialize database
    await initDatabase();
    
    // Start Express server
    const server = app.listen(config.port, () => {
      console.log('=================================================');
      console.log(`Global Gaming Leaderboard API`);
      console.log(`Environment: ${config.env}`);
      console.log(`Server running on port ${config.port}`);
      console.log(`Database: SQLite (${config.database.storage})`);
      console.log('=================================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\nShutting down gracefully...');
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        await sequelize.close();
        console.log('Database connection closed');
        
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forcing shutdown...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
