// src/navigation/RootStackParamList.ts

import { Book } from '../models/Book';

export type RootStackParamList = {
  Home: undefined; // No parameters
  BookDetails: { bookId: number }; // Parameters for BookDetails
  AddReadingSession: { bookId: number }; // Parameters for AddReadingSession
  EditBook: { book: Book }; // Parameters for EditBook
  // Add other screens here
};