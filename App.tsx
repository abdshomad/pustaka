/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useLibrary from './hooks/useLibrary';
import BookCard from './components/BookCard';
import AddBookModal from './components/AddBookModal';
import Footer from './components/Footer';
import BookDetailModal from './components/BookDetailModal';
import { getBookDescription, fetchBestsellersByCountry } from './services/bookService';
import type { Book } from './services/bookService';

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

const getCountryName = (): string => {
    try {
      const userLocale = navigator.language || 'en-US';
      // Use Intl.Locale to robustly get the region code (e.g., 'en-US' -> 'US')
      const regionCode = new Intl.Locale(userLocale).region;
      if (regionCode) {
          // Use Intl.DisplayNames to get the full country name (e.g., 'US' -> 'United States')
          const displayName = new Intl.DisplayNames(['en'], { type: 'region' });
          return displayName.of(regionCode) || 'the United States';
      }
    } catch (e) {
      console.warn('Could not determine country from locale, falling back.', e);
    }
    // A sensible default if Intl APIs fail or no region code is found
    return 'the United States';
};

function App() {
  const { library, addBook, removeBook } = useLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('added');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // State for sample books when library is empty
  const [sampleBooks, setSampleBooks] = useState<Book[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [samplesError, setSamplesError] = useState<string | null>(null);
  
  // Fetch sample books when the library is empty
  useEffect(() => {
    if (library.length === 0) {
      const loadSampleBooks = async () => {
        setIsLoadingSamples(true);
        setSamplesError(null);
        try {
          const country = getCountryName();
          const bestsellers = await fetchBestsellersByCountry(country);
          setSampleBooks(bestsellers);
        } catch (error) {
          console.error("Failed to load sample books:", error);
          setSamplesError("Could not load popular books at this time.");
        } finally {
          setIsLoadingSamples(false);
        }
      };
      loadSampleBooks();
    }
  }, [library.length]); // Reruns if the library becomes empty again

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortDirection(newSortBy === 'added' ? 'desc' : 'asc');
    }
  };

  const sortedLibrary = useMemo(() => {
    const libraryCopy = [...library];
    if (sortBy === 'added') {
      return sortDirection === 'asc' ? libraryCopy.reverse() : libraryCopy;
    }
    libraryCopy.sort((a, b) => {
      const field = sortBy === 'title' ? a.title : a.author;
      const compareField = sortBy === 'title' ? b.title : b.author;
      return field.localeCompare(compareField);
    });
    return sortDirection === 'desc' ? libraryCopy.reverse() : libraryCopy;
  }, [library, sortBy, sortDirection]);

  const handleBookClick = async (book: Book) => {
    setSelectedBook(book);
    setIsLoadingDetails(true);
    const description = await getBookDescription(book.key);
    setSelectedBook({ ...book, description });
    setIsLoadingDetails(false);
  };

  const handleCloseDetailModal = () => {
    setSelectedBook(null);
  };

  const renderEmptyState = () => {
    if (isLoadingSamples) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 h-full mt-16">
          <svg className="animate-spin h-12 w-12 text-yellow-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-bold mt-4">Finding popular books...</h2>
          <p className="mt-2">Curating a list of bestsellers for you.</p>
        </div>
      );
    }

    if (sampleBooks.length > 0 && !samplesError) {
      return (
        <>
            <div className="text-center mb-6 mt-8">
                <h2 className="text-3xl font-bold text-neutral-300">Your Bookshelf is Empty</h2>
                <p className="text-neutral-400 mt-1">Get started by adding some of these popular books.</p>
            </div>
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full">
              <AnimatePresence>
                {sampleBooks.map((book) => (
                  <BookCard
                    key={book.key}
                    book={book}
                    onAdd={addBook}
                    isAdded={library.some(libBook => libBook.key === book.key)}
                    onClick={handleBookClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
        </>
      );
    }
    
    // Fallback to original empty state if samples fail or return empty
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 h-full mt-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-2xl font-bold mt-4">Your bookshelf is empty</h2>
            <p className="mt-2">{samplesError || "Click the '+' button to add your first book."}</p>
          </div>
    );
  }

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
                  <BookCard
                    key={book.key}
                    book={book}
                    onRemove={removeBook}
                    onClick={handleBookClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          renderEmptyState()
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
      
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            isLoading={isLoadingDetails}
            onClose={handleCloseDetailModal}
          />
        )}
      </AnimatePresence>

      <Footer bookCount={library.length} />
    </main>
  );
}

export default App;
