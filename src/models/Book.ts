// src/models/Book.ts

export interface Book {
  id?: number; // Id is optional for new books before insertion
  title: string;
  author: string;
  genre?: string;
  coverImage?: string; // URL or local path
  totalPages?: number;
  currentPage?: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  notes?: string;
}