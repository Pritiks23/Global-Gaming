const { Sequelize } = require('sequelize');
const config = require('./index');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.dirname(config.database.storage);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.database.storage,
  logging: config.database.logging,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
