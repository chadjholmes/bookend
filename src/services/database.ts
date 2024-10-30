// src/services/database.ts

import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "bookend.db"; // Ensure consistent naming
// const database_version = "1.0";
// const database_displayname = "Book Tracker Database";
// const database_size = 200000; // Size in bytes

let db: SQLiteDatabase | null = null;

/**
 * Initializes the SQLite database.
 * @returns {Promise<SQLiteDatabase>} The opened database instance.
 */
export const initDB = async (): Promise<SQLiteDatabase> => {
  if (db) {
    return db;
  }

  const dbOptions = {
    name: database_name,
    location: 'default', // Correct property name; valid values: 'default', 'Library', 'Documents', 'tmp'
  };

  try {
    db = await SQLite.openDatabase(dbOptions);
    console.log("Database opened successfully");

    // Create Books table if it doesn't exist
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS Books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT,
        coverImage TEXT,
        totalPages INTEGER,
        currentPage INTEGER DEFAULT 0,
        startDate TEXT,
        endDate TEXT,
        notes TEXT
      );
    `);

    // Create ReadingSessions table if it doesn't exist
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS ReadingSessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookId INTEGER,
        date TEXT,
        duration INTEGER,
        pagesRead INTEGER,
        notes TEXT,
        FOREIGN KEY (bookId) REFERENCES Books(id)
      );
    `);

    return db;
  } catch (error) {
    console.error("Failed to open/create database:", error);
    throw error;
  }
};

/**
 * Closes the SQLite database.
 */
export const closeDB = async (): Promise<void> => {
  if (db) {
    try {
      await db.close();
      console.log("Database CLOSED");
      db = null;
    } catch (error) {
      console.error("Error closing DB:", error);
      throw error;
    }
  } else {
    console.log("Database was not opened");
  }
};