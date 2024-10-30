// src/models/ReadingSession.ts

export interface ReadingSession {
  id?: number;
  bookId: number;
  date: string; // ISO date string
  duration: number; // Duration in minutes
  pagesRead: number;
  notes?: string;
}