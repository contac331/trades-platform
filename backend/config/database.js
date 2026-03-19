const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database', 'database.sqlite'),
  logging: console.log // Set to console.log to see SQL queries
});

module.exports = sequelize;
