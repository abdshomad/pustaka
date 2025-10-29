/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect, useCallback } from 'react';
import type { Book } from '../services/bookService';

const LIBRARY_STORAGE_KEY = 'digital-bookshelf-library';

export default function useLibrary() {
  const [library, setLibrary] = useState<Book[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (stored) {
        setLibrary(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error reading library from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    } catch (error)
 {
      console.error("Error writing library to localStorage", error);
    }
  }, [library]);

  const addBook = useCallback((book: Book) => {
    setLibrary((prev) => {
      if (prev.some(b => b.key === book.key)) {
        console.warn("Book is already in the library.");
        return prev;
      }
      return [book, ...prev];
    });
  }, []);

  const removeBook = useCallback((bookKey: string) => {
    setLibrary((prev) => prev.filter((b) => b.key !== bookKey));
  }, []);

  return { library, addBook, removeBook };
}
