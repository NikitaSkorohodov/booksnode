const { Sequelize } = require('sequelize');

// Конфигурация подключения к базе данных
const sequelize = new Sequelize('books', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
