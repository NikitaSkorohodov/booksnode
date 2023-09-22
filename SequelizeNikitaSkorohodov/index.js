const fs = require('fs');
const path = require('path');
const sequelize = require('./config/db');
const Book = require('./create/book');
const Author = require('./create/author');
const Category = require('./create/category');


const moment = require('moment');

const BookCategory = sequelize.define('BookCategory', {}, {
  timestamps: false,
  tableName: 'BookCategory',
});

const BookAuthor = sequelize.define('BookAuthor', {}, {
  timestamps: false,
  tableName: 'BookAuthor',
});

Book.belongsToMany(Category, { through: BookCategory });
Category.belongsToMany(Book, { through: BookCategory });

Book.belongsToMany(Author, { through: BookAuthor });
Author.belongsToMany(Book, { through: BookAuthor });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('db подключено.');

    await sequelize.sync({ force: true });

    const rawData = fs.readFileSync(path.join(__dirname, 'books-data.json'));
    const booksData = JSON.parse(rawData);

    const authorsMap = new Map();
    const categoriesMap = new Map();

    for (const bookData of booksData) {
      const authors = bookData.authors;
      const categories = bookData.categories;

      for (const authorName of authors) {
        if (!authorsMap.has(authorName)) {
          authorsMap.set(authorName, { name: authorName });
        }
      }

      for (const categoryName of categories) {
        if (!categoriesMap.has(categoryName)) {
          categoriesMap.set(categoryName, { name: categoryName });
        }
      }
    }

    const authorRecords = Array.from(authorsMap.values());
    const categoryRecords = Array.from(categoriesMap.values());

    await Author.bulkCreate(authorRecords);
    await Category.bulkCreate(categoryRecords);

    const authorsFromDB = await Author.findAll();
    const categoriesFromDB = await Category.findAll();

    for (const bookData of booksData) {
      if (bookData.publishedDate && bookData.publishedDate.$date) {
        const formattedDate = moment(bookData.publishedDate.$date).format('YYYY-MM-DD HH:mm:ss');
        bookData.publishedDate = formattedDate;

        const book = await Book.create(bookData);

        for (const categoryName of bookData.categories) {
          const category = categoriesFromDB.find((category) => category.name === categoryName);
          if (category) {
            await book.addCategory(category);
          }
        }

        for (const authorName of bookData.authors) {
          const author = authorsFromDB.find((author) => author.name === authorName);
          if (author) {
            await book.addAuthor(author);
          }
        }
      } else {
        console.error('Invalid publishedDate format:', bookData.publishedDate);
      }
    }

    console.log('Информация записана в базу данных.');
  } finally {
    await sequelize.close();
    console.log('соединение закрыто.');
  }
})();
