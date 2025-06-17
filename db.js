// db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name
  process.env.DB_USER,     // Username
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,       // set to console.log to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Optional: Test connection immediately
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connected to MySQL database successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
  }
}

testConnection();

module.exports = sequelize;

