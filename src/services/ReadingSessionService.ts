// src/services/ReadingSessionService.ts

import { ReadingSession } from '../models/ReadingSession';
import { initDB } from './database';
import SQLite, { ResultSet, Transaction } from 'react-native-sqlite-storage';

export const getReadingSessions = async (bookId: number): Promise<ReadingSession[]> => {
  try {
    const db = await initDB();
    const results: [ResultSet] = await db.executeSql(
      `SELECT * FROM ReadingSessions WHERE bookId = ? ORDER BY date DESC;`,
      [bookId]
    );
    const sessions: ReadingSession[] = [];

    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) {
        sessions.push(result.rows.item(i));
      }
    });

    return sessions;
  } catch (error) {
    console.error("getReadingSessions Error: ", error);
    return [];
  }
};

export const addReadingSession = async (session: ReadingSession): Promise<void> => {
  const { bookId, date, duration, pagesRead, notes } = session;
  try {
    const db = await initDB();
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `INSERT INTO ReadingSessions (bookId, date, duration, pagesRead, notes) VALUES (?, ?, ?, ?, ?);`,
        [bookId, date, duration, pagesRead, notes]
      );

      // Update the currentPage in Books table
      await tx.executeSql(
        `UPDATE Books SET currentPage = currentPage + ? WHERE id = ?;`,
        [pagesRead, bookId]
      );
    });
  } catch (error) {
    console.error("addReadingSession Error: ", error);
    throw error;
  }
};

export const updateReadingSession = async (session: ReadingSession): Promise<void> => {
  const { id, bookId, date, duration, pagesRead, notes } = session;
  if (!id) throw new Error("Session ID is required for update.");

  try {
    const db = await initDB();
    await db.transaction(async (tx) => {
      // Fetch existing session to get previous pagesRead
      const [_, existingResult] = await tx.executeSql(
        `SELECT pagesRead FROM ReadingSessions WHERE id = ?;`,
        [id]
      );
      if (existingResult.rows.length === 0) {
        throw new Error("Reading session not found.");
      }
      const previousPagesRead = existingResult.rows.item(0).pagesRead || 0;

      await tx.executeSql(
        `UPDATE ReadingSessions SET bookId = ?, date = ?, duration = ?, pagesRead = ?, notes = ? WHERE id = ?;`,
        [bookId, date, duration, pagesRead, notes, id]
      );

      // Update the currentPage in Books table
      const pagesDifference = pagesRead - previousPagesRead;
      await tx.executeSql(
        `UPDATE Books SET currentPage = currentPage + ? WHERE id = ?;`,
        [pagesDifference, bookId]
      );
    });
  } catch (error) {
    console.error("updateReadingSession Error: ", error);
    throw error;
  }
};

export const deleteReadingSession = async (session: ReadingSession): Promise<void> => {
  const { id, bookId, pagesRead } = session;
  if (!id || !bookId) throw new Error("Session ID and Book ID are required for deletion.");

  try {
    const db = await initDB();
    await db.transaction(async (tx) => {
      await tx.executeSql(`DELETE FROM ReadingSessions WHERE id = ?;`, [id]);

      // Update the currentPage in Books table
      await tx.executeSql(
        `UPDATE Books SET currentPage = currentPage - ? WHERE id = ?;`,
        [pagesRead, bookId]
      );
    });
  } catch (error) {
    console.error("deleteReadingSession Error: ", error);
    throw error;
  }
};

// src/services/ReadingSessionService.ts

export const getAllSessions = async (): Promise<ReadingSession[]> => {
  try {
    const db = await initDB();
    const results: [ResultSet] = await db.executeSql(
      `SELECT * FROM ReadingSessions ORDER BY date DESC;`
    );
    const sessions: ReadingSession[] = [];

    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) {
        sessions.push(result.rows.item(i));
      }
    });

    return sessions;
  } catch (error) {
    console.error("getAllSessions Error: ", error);
    return [];
  }
};