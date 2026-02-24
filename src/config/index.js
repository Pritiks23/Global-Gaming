require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  database: {
    storage: process.env.DB_STORAGE || './data/leaderboard.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },
  
  leaderboard: {
    maxSize: parseInt(process.env.MAX_LEADERBOARD_SIZE) || 10000,
  }
};
