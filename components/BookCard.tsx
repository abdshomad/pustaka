/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';
import type { Book } from '../services/bookService';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  onRemove?: (bookKey: string) => void;
  onAdd?: (book: Book) => void;
  isAdded?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onRemove, onClick, onAdd, isAdded }) => {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(book.key);
    } else if (onAdd && !isAdded) {
      onAdd(book);
    }
  };
  
  const renderActionButton = () => {
    if (onRemove) {
      return (
        <button
          onClick={handleAction}
          className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
          aria-label={`Remove ${book.title} from library`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      );
    }

    if (onAdd) {
      return (
        <button
          onClick={handleAction}
          disabled={isAdded}
          className={`absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 ${
            isAdded ? 'bg-green-600 cursor-not-allowed !opacity-100' : 'hover:bg-green-500'
          }`}
          aria-label={isAdded ? `${book.title} is in your library` : `Add ${book.title} to library`}
        >
          {isAdded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      );
    }
    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="relative group aspect-[2/3] overflow-hidden rounded-md shadow-lg cursor-pointer"
      onClick={() => onClick(book)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${book.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(book);
        }
      }}
    >
      <img
        src={book.coverUrl}
        alt={`Cover of ${book.title}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Gradient overlay on hover to make text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
      
      <div className="absolute inset-0 p-3 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="font-bold text-sm leading-tight drop-shadow-md">{book.title}</h3>
        <p className="text-xs text-neutral-300 drop-shadow-md">{book.author}</p>
      </div>

      {renderActionButton()}
    </motion.div>
  );
};

export default BookCard;
