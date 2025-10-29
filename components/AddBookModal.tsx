/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchBooks, Book } from '../services/bookService';
import { identifyBookFromImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface AddBookModalProps {
  onClose: () => void;
  onBookAdded: (book: Book) => void;
  library: Book[];
}

const SearchResultCard: React.FC<{ book: Book, onAdd: () => void, isAdded: boolean }> = ({ book, onAdd, isAdded }) => {
    const { t } = useLanguage();
    return (
        <div className="flex items-center gap-4 p-2 bg-neutral-700/50 rounded-md">
            <img src={book.coverUrl} alt={book.title} className="w-12 h-18 object-cover rounded-sm flex-shrink-0" />
            <div className="overflow-hidden">
                <p className="font-bold truncate text-white">{book.title}</p>
                <p className="text-sm text-neutral-400 truncate">{book.author}</p>
            </div>
            <button
                onClick={onAdd}
                disabled={isAdded}
                className="ml-auto text-yellow-400 disabled:text-neutral-500 disabled:cursor-not-allowed flex-shrink-0 bg-neutral-800 disabled:bg-neutral-700 px-3 py-1 rounded-md text-sm font-semibold transition-colors"
            >
                {isAdded ? t('added') : t('add')}
            </button>
        </div>
    );
};

const ScannedBookCard: React.FC<{ book: Book, isAlreadyInLibrary: boolean }> = ({ book, isAlreadyInLibrary }) => {
    const { t } = useLanguage();
    return (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-2 bg-neutral-700/50 rounded-md"
    >
        <img src={book.coverUrl} alt={book.title} className="w-12 h-18 object-cover rounded-sm flex-shrink-0" />
        <div className="overflow-hidden">
            <p className="font-bold truncate text-white">{book.title}</p>
            <p className="text-sm text-neutral-400 truncate">{book.author}</p>
        </div>
        <div className="ml-auto text-green-400 flex-shrink-0 flex items-center gap-2">
            {isAlreadyInLibrary ? (
                <span className="text-xs text-neutral-400 font-semibold">{t('inLibrary')}</span>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">{t('added')}</span>
                </>
            )}
        </div>
    </motion.div>
    );
};


const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <svg className="animate-spin h-8 w-8 text-yellow-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-neutral-300">{text}</p>
    </div>
);

const AddBookModal: React.FC<AddBookModalProps> = ({ onClose, onBookAdded, library }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'text' | 'camera'>('camera');
  
  // State for text search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'no-results'>('idle');
  const [error, setError] = useState('');

  // State for camera scanning
  const [cameraState, setCameraState] = useState<'off' | 'starting' | 'on'>('off');
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [scannedBooks, setScannedBooks] = useState<Book[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setCameraState('off');
  }, []);

  const startCamera = useCallback(async () => {
    if (cameraState === 'on' || cameraState === 'starting') return;
    
    stopCamera();
    setCameraState('starting');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setCameraState('on');
        }
    } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please check permissions.");
        setStatus('error'); // Use the main error state for camera start failure
        setCameraState('off');
    }
  }, [stopCamera, cameraState]);

  useEffect(() => {
    if (mode === 'text' && inputRef.current) {
        inputRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessingScan) return;
    
    setIsProcessingScan(true);
    setScanError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvas.toDataURL('image/jpeg');

    try {
      const bookDetails = await identifyBookFromImage(dataUrl);
      const foundBooks = await searchBooks(`${bookDetails.title} ${bookDetails.author}`);

      if (foundBooks.length > 0) {
        const bookToAdd = foundBooks[0];
        
        if (!library.some(b => b.key === bookToAdd.key)) {
            onBookAdded(bookToAdd);
        }

        if (!scannedBooks.some(b => b.key === bookToAdd.key)) {
            setScannedBooks(prev => [bookToAdd, ...prev]);
        }
      } else {
        throw new Error(`Could not find a book matching "${bookDetails.title}". Try a different angle or lighting.`);
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'An unknown error occurred while scanning.');
    } finally {
      setIsProcessingScan(false);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setStatus('loading');
    setError('');
    setResults([]);
    try {
        const foundBooks = await searchBooks(searchQuery);
        setResults(foundBooks);
        setStatus(foundBooks.length > 0 ? 'idle' : 'no-results');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setStatus('error');
    }
  };

  const handleModeChange = (newMode: 'text' | 'camera') => {
    setMode(newMode);
    setResults([]);
    setStatus('idle');
    setError('');
    setQuery('');
    setScannedBooks([]);
    setScanError(null);
    setIsProcessingScan(false);

    if (newMode === 'camera') {
        startCamera();
    } else if (newMode === 'text') {
        stopCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-700 flex-shrink-0">
          <div className="flex bg-neutral-900 rounded-md p-1">
            <button onClick={() => handleModeChange('text')} className={`w-1/2 py-2 rounded ${mode === 'text' ? 'bg-yellow-500 text-black' : 'text-white'} font-semibold transition-colors`}>{t('searchTab')}</button>
            <button onClick={() => handleModeChange('camera')} className={`w-1/2 py-2 rounded ${mode === 'camera' ? 'bg-yellow-500 text-black' : 'text-white'} font-semibold transition-colors`}>{t('scanTab')}</button>
          </div>
        </div>

        {mode === 'text' && (
            <div className="p-4 flex-shrink-0">
                <form onSubmit={e => { e.preventDefault(); handleSearch(query); }} className="flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition-colors">{t('searchButton')}</button>
                </form>
            </div>
        )}

        <div className="overflow-y-auto flex-1 min-h-0">
          {mode === 'camera' && (
            <div className="p-4 pt-0">
              <div className="relative aspect-video bg-black rounded-md overflow-hidden mb-4">
                {cameraState === 'starting' && <LoadingSpinner text={t('cameraStarting')} />}
                <video ref={videoRef} className={`w-full h-full object-contain ${cameraState !== 'on' ? 'hidden' : 'block'}`} playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                
                {cameraState === 'on' && (
                    <button onClick={handleCapture} disabled={isProcessingScan} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 border-4 border-white rounded-full backdrop-blur-sm transition-opacity disabled:opacity-50" aria-label={t('captureTooltip')}></button>
                )}

                {isProcessingScan && (
                     <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                        <LoadingSpinner text={t('scanning')} />
                    </div>
                )}
              </div>

              <div>
                  <h3 className="font-semibold text-neutral-300 mb-2 px-1">{t('scannedSession')}</h3>
                  {scanError && <p className="text-red-400 text-sm px-1 mb-2">{scanError}</p>}
                  {scannedBooks.length > 0 ? (
                      <div className="space-y-2">
                          <AnimatePresence>
                             {scannedBooks.map(book => (
                                  <ScannedBookCard
                                      key={book.key}
                                      book={book}
                                      isAlreadyInLibrary={library.some(libBook => libBook.key === book.key)}
                                  />
                              ))}
                          </AnimatePresence>
                      </div>
                  ) : (
                    !scanError && <p className="text-neutral-500 text-sm text-center py-4">{t('scanInstructions')}</p>
                  )}
              </div>
            </div>
          )}
          
          {mode === 'text' && (
              <>
                {status === 'loading' && <LoadingSpinner text="Searching..."/>}
                {status === 'error' && <div className="text-center p-8 text-red-400"><p>{error}</p></div>}
                {status === 'no-results' && <div className="text-center p-8 text-neutral-400">{t('noResults')}</div>}
                
                {results.length > 0 && (
                    <div className="px-4 pb-4 space-y-2">
                        {results.map(book => (
                            <SearchResultCard
                                key={book.key}
                                book={book}
                                onAdd={() => onBookAdded(book)}
                                isAdded={library.some(libBook => libBook.key === book.key)}
                            />
                        ))}
                    </div>
                )}
              </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddBookModal;