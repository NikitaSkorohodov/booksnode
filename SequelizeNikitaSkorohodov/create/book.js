const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isbn: DataTypes.STRING,
  pageCount: DataTypes.INTEGER,
  publishedDate: DataTypes.DATE,
  thumbnailUrl: DataTypes.STRING,
  shortDescription: DataTypes.TEXT,
  longDescription: DataTypes.TEXT,
  status: DataTypes.STRING,
}, {
  timestamps: false 
});

module.exports = Book;
