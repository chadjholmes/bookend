// BookService.js
import { initDB } from './database';

export const getBooks = async () => {
  try {
    const db = await initDB();
    const [results] = await db.executeSql(`SELECT * FROM Books;`);
    let books = [];
    for (let i = 0; i < results.rows.length; i++) {
      books.push(results.rows.item(i));
    }
    return books;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addBook = async (book) => {
  const { title, author, genre, coverImage, totalPages, startDate, notes } = book;
  try {
    const db = await initDB();
    await db.executeSql(
      `INSERT INTO Books (title, author, genre, coverImage, totalPages, startDate, notes) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [title, author, genre, coverImage, totalPages, startDate, notes]
    );
  } catch (error) {
    console.error(error);
  }
};

// Similarly, implement updateBook, deleteBook, etc.