// src/services/BookService.ts
import { Book } from '../models/Book';
import { initDB } from './database';
import SQLite, { SQLResultSet, SQLTransaction } from 'react-native-sqlite-storage';

export const getBooks = async (): Promise<Book[]> => {
  try {
    const db = await initDB();
    const results: [SQLResultSet] = await db.executeSql(`SELECT * FROM Books;`);
    const books: Book[] = [];

    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) {
        books.push(result.rows.item(i));
      }
    });

    return books;
  } catch (error) {
    console.error("getBooks Error: ", error);
    return [];
  }
};

export const addBook = async (book: Book): Promise<void> => {
  const { title, author, genre, coverImage, totalPages, startDate, notes } = book;
  try {
    const db = await initDB();
    await db.executeSql(
      `INSERT INTO Books (title, author, genre, coverImage, totalPages, startDate, notes) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [title, author, genre, coverImage, totalPages, startDate, notes]
    );
  } catch (error) {
    console.error("addBook Error: ", error);
    throw error;
  }
};

export const updateBook = async (book: Book): Promise<void> => {
  const { id, title, author, genre, coverImage, totalPages, currentPage, startDate, endDate, notes } = book;
  if (!id) throw new Error("Book ID is required for update.");

  try {
    const db = await initDB();
    await db.executeSql(
      `UPDATE Books SET title = ?, author = ?, genre = ?, coverImage = ?, totalPages = ?, currentPage = ?, startDate = ?, endDate = ?, notes = ? WHERE id = ?;`,
      [title, author, genre, coverImage, totalPages, currentPage, startDate, endDate, notes, id]
    );
  } catch (error) {
    console.error("updateBook Error: ", error);
    throw error;
  }
};

export const deleteBook = async (id: number): Promise<void> => {
  try {
    const db = await initDB();
    await db.executeSql(`DELETE FROM Books WHERE id = ?;`, [id]);
    await db.executeSql(`DELETE FROM ReadingSessions WHERE bookId = ?;`, [id]); // Optionally delete associated sessions
  } catch (error) {
    console.error("deleteBook Error: ", error);
    throw error;
  }
};