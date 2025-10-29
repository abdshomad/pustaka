/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useLibrary from './hooks/useLibrary';
import BookCard from './components/BookCard';
import AddBookModal from './components/AddBookModal';
import Footer from './components/Footer';

function App() {
  const { library, addBook, removeBook } = useLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="bg-neutral-900 text-neutral-200 min-h-screen w-full flex flex-col items-center p-4 sm:p-8 pb-24 relative">
      <div className="text-center my-8 z-10">
        <h1 className="text-6xl md:text-7xl font-caveat font-bold text-neutral-100">Digital Bookshelf</h1>
        <p className="text-neutral-400 mt-2 text-lg">Your personal collection, always with you.</p>
      </div>

      <div className="w-full max-w-7xl flex-1">
        {library.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full">
            <AnimatePresence>
              {library.map((book) => (
                <BookCard key={book.key} book={book} onRemove={removeBook} />
              ))}
            </AnimatePresence>
          </motion.div>
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