/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';
import type { Book } from '../services/bookService';

interface BookCardProps {
  book: Book;
  onRemove: (bookKey: string) => void;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onRemove, onClick }) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(book.key);
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

      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
        aria-label={`Remove ${book.title} from library`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default BookCard;
