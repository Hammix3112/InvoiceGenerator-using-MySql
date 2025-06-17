const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Your Sequelize connection instance
const User = require('./User'); // Your User model

const History = sequelize.define('History', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'history',
  timestamps: false
});

// Association: History belongs to User
History.belongsTo(User, { foreignKey: 'userId' });

module.exports = History;
