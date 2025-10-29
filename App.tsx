/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useLibrary from './hooks/useLibrary';
import BookCard from './components/BookCard';
import AddBookModal from './components/AddBookModal';
import Footer from './components/Footer';

type SortBy = 'added' | 'title' | 'author';
type SortDirection = 'asc' | 'desc';

// A small, self-contained component for the sort buttons to keep the main component clean.
const SortButton: React.FC<{
  label: string;
  column: SortBy;
  activeColumn: SortBy;
  direction: SortDirection;
  onClick: () => void;
}> = ({ label, column, activeColumn, direction, onClick }) => {
  const isActive = column === activeColumn;
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
        isActive
          ? 'bg-yellow-500 text-black'
          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
      }`}
      aria-label={`Sort by ${label} in ${isActive && direction === 'asc' ? 'descending' : 'ascending'} order`}
    >
      {label}
      {isActive && (
        <motion.div
          key={direction}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0, rotate: direction === 'asc' ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.div>
      )}
    </button>
  );
};


function App() {
  const { library, addBook, removeBook } = useLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('added');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      // If clicking the same button, toggle direction
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // If clicking a new button, set new sort type and default direction
      setSortBy(newSortBy);
      setSortDirection(newSortBy === 'added' ? 'desc' : 'asc');
    }
  };

  const sortedLibrary = useMemo(() => {
    const libraryCopy = [...library];

    if (sortBy === 'added') {
      // The hook already returns newest first, which is 'desc'
      return sortDirection === 'asc' ? libraryCopy.reverse() : libraryCopy;
    }

    libraryCopy.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // sortBy === 'author'
      return a.author.localeCompare(b.author);
    });

    if (sortDirection === 'desc') {
      return libraryCopy.reverse();
    }

    return libraryCopy;
  }, [library, sortBy, sortDirection]);

  return (
    <main className="bg-neutral-900 text-neutral-200 min-h-screen w-full flex flex-col items-center p-4 sm:p-8 pb-24 relative">
      <div className="text-center my-8 z-10">
        <h1 className="text-6xl md:text-7xl font-caveat font-bold text-neutral-100">Digital Bookshelf</h1>
        <p className="text-neutral-400 mt-2 text-lg">Your personal collection, always with you.</p>
      </div>

      <div className="w-full max-w-7xl flex-1">
        {library.length > 0 ? (
          <>
            <div className="flex items-center justify-end gap-2 mb-4 px-1">
              <span className="text-neutral-400 text-sm mr-2">Sort by:</span>
              <SortButton label="Date Added" column="added" activeColumn={sortBy} direction={sortDirection} onClick={() => handleSortChange('added')} />
              <SortButton label="Title" column="title" activeColumn={sortBy} direction={sortDirection} onClick={() => handleSortChange('title')} />
              <SortButton label="Author" column="author" activeColumn={sortBy} direction={sortDirection} onClick={() => handleSortChange('author')} />
            </div>
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full">
              <AnimatePresence>
                {sortedLibrary.map((book) => (
                  <BookCard key={book.key} book={book} onRemove={removeBook} />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 h-full mt-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-2xl font-bold mt-4">Your bookshelf is empty</h2>
            <p className="mt-2">Click the '+' button to add your first book.</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-yellow-400 transform transition-transform hover:scale-110 z-50"
        aria-label="Add new book"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <AddBookModal
            onClose={() => setIsModalOpen(false)}
            onBookAdded={(book) => {
              addBook(book);
              setIsModalOpen(false);
            }}
            library={library}
          />
        )}
      </AnimatePresence>

      <Footer bookCount={library.length} />
    </main>
  );
}

export default App;
