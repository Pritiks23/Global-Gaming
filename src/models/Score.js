const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserScore = sequelize.define('UserScore', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  totalScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  games: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_scores',
  timestamps: true,
  indexes: [
    {
      fields: ['totalScore']
    }
  ]
});

module.exports = { UserScore };
