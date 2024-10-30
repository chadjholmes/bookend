// src/context/BookContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Book } from '../models/Book';
import { getBooks, addBook, updateBook, deleteBook } from '../services/BookService';

interface BookContextProps {
  books: Book[];
  refreshBooks: () => Promise<void>;
  addNewBook: (book: Book) => Promise<void>;
  editBook: (book: Book) => Promise<void>;
  removeBook: (id: number) => Promise<void>;
}

export const BookContext = createContext<BookContextProps>({
  books: [],
  refreshBooks: async () => {},
  addNewBook: async () => {},
  editBook: async () => {},
  removeBook: async () => {},
});

export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);

  const refreshBooks = async () => {
    const fetchedBooks = await getBooks();
    setBooks(fetchedBooks);
  };

  const addNewBook = async (book: Book) => {
    await addBook(book);
    await refreshBooks();
  };

  const editBook = async (book: Book) => {
    await updateBook(book);
    await refreshBooks();
  };

  const removeBook = async (id: number) => {
    await deleteBook(id);
    await refreshBooks();
  };

  useEffect(() => {
    refreshBooks();
  }, []);

  return (
    <BookContext.Provider value={{ books, refreshBooks, addNewBook, editBook, removeBook }}>
      {children}
    </BookContext.Provider>
  );
};