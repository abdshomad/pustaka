/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';
import { Book } from '../services/bookService';
import { useLanguage } from '../contexts/LanguageContext';

interface BookDetailModalProps {
  book: Book;
  isLoading: boolean;
  onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <svg className="animate-spin h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, isLoading, onClose }) => {
  const { t } = useLanguage();

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col sm:flex-row overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full sm:w-1/3 flex-shrink-0 bg-neutral-900">
            <img src={book.coverUrl} alt={`Cover of ${book.title}`} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col p-6 overflow-y-auto">
            <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{book.title}</h2>
                <p className="text-lg text-neutral-300 mb-4">{book.author}</p>
                {book.isbn && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-neutral-400 text-sm">{t('isbn')}</h3>
                        <p className="text-neutral-200">{book.isbn}</p>
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-neutral-400 text-sm mb-1">{t('description')}</h3>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <p className="text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">
                            {book.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-6 flex-shrink-0">
                <button
                    onClick={onClose}
                    className="w-full bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
                >
                    {t('close')}
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookDetailModal;