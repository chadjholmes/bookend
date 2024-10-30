// src/context/ReadingSessionContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ReadingSession } from '../models/ReadingSession';
import { getReadingSessions, addReadingSession as addSession, updateReadingSession, deleteReadingSession as deleteSession } from '../services/ReadingSessionService';

interface ReadingSessionContextProps {
  sessions: ReadingSession[];
  refreshSessions: (bookId: number) => Promise<void>;
  addReadingSession: (session: ReadingSession) => Promise<void>;
  editReadingSession: (session: ReadingSession) => Promise<void>;
  deleteReadingSession: (session: ReadingSession) => Promise<void>;
}

export const ReadingSessionContext = createContext<ReadingSessionContextProps>({
  sessions: [],
  refreshSessions: async () => {},
  addReadingSession: async () => {},
  editReadingSession: async () => {},
  deleteReadingSession: async () => {},
});

export const ReadingSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);

  const refreshSessions = async (bookId: number) => {
    const fetchedSessions = await getReadingSessions(bookId);
    setSessions(fetchedSessions);
  };

  const addReadingSession = async (session: ReadingSession) => {
    await addSession(session);
    await refreshSessions(session.bookId);
  };

  const editReadingSession = async (session: ReadingSession) => {
    await updateReadingSession(session);
    await refreshSessions(session.bookId);
  };

  const deleteReadingSession = async (session: ReadingSession) => {
    await deleteSession(session);
    await refreshSessions(session.bookId);
  };

  return (
    <ReadingSessionContext.Provider value={{ sessions, refreshSessions, addReadingSession, editReadingSession, deleteReadingSession }}>
      {children}
    </ReadingSessionContext.Provider>
  );
};