require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  mongodb: {
    uri: process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/gaming-leaderboard',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  redis: {
    host: process.env.REDIS_HOST || process.env.REDIS_HOST_LOCAL || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes default
  },
  
  leaderboard: {
    maxSize: parseInt(process.env.MAX_LEADERBOARD_SIZE) || 10000,
  }
};
