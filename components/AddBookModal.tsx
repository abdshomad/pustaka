/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { searchBooks, Book } from '../services/bookService';
import { identifyBookFromImage } from '../services/geminiService';

interface AddBookModalProps {
  onClose: () => void;
  onBookAdded: (book: Book) => void;
  library: Book[];
}

const SearchResultCard: React.FC<{ book: Book, onAdd: () => void, isAdded: boolean }> = ({ book, onAdd, isAdded }) => (
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
            {isAdded ? 'Added' : 'Add'}
        </button>
    </div>
);

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
  const [mode, setMode] = useState<'text' | 'camera'>('camera');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'no-results'>('idle');
  const [error, setError] = useState('');
  const [cameraState, setCameraState] = useState<'off' | 'starting' | 'on' | 'captured'>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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
    // Don't restart if already on
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
        setStatus('error');
        setCameraState('off');
    }
  }, [stopCamera, cameraState]);

  useEffect(() => {
    // Focus the input field when the modal opens in 'text' mode
    if (mode === 'text' && inputRef.current) {
        inputRef.current.focus();
    }
  }, [mode]);

  // Start camera on mount since it's the default mode.
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setCameraState('captured');
        stopCamera();
        handleImageSearch(dataUrl);
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

  const handleImageSearch = async (imageDataUrl: string) => {
    setStatus('loading');
    setError('');
    setResults([]);
    try {
        const bookDetails = await identifyBookFromImage(imageDataUrl);
        await handleSearch(`${bookDetails.title} ${bookDetails.author}`);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while scanning.');
        setStatus('error');
        setCapturedImage(null);
        setCameraState('off');
    }
  };

  const handleModeChange = (newMode: 'text' | 'camera') => {
    setMode(newMode);
    setResults([]);
    setStatus('idle');
    setError('');
    setQuery('');
    setCapturedImage(null);
    if (newMode === 'camera') {
        startCamera();
    } else if (newMode === 'text') {
        stopCamera();
    }
  };

  // Cleanup camera on component unmount
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
            <button onClick={() => handleModeChange('text')} className={`w-1/2 py-2 rounded ${mode === 'text' ? 'bg-yellow-500 text-black' : 'text-white'} font-semibold transition-colors`}>Search Text</button>
            <button onClick={() => handleModeChange('camera')} className={`w-1/2 py-2 rounded ${mode === 'camera' ? 'bg-yellow-500 text-black' : 'text-white'} font-semibold transition-colors`}>Scan Cover</button>
          </div>
        </div>

        <div className="p-4 flex-shrink-0">
          {mode === 'text' && (
            <form onSubmit={e => { e.preventDefault(); handleSearch(query); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by Title, Author, or ISBN..."
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition-colors">Search</button>
            </form>
          )}
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {mode === 'camera' && (
            <div className="p-4 pt-0">
                {cameraState === 'starting' && <LoadingSpinner text="Starting camera..." />}
                {(cameraState === 'on' || cameraState === 'captured') && (
                    <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                        <video ref={videoRef} className={`w-full h-full object-contain ${cameraState !== 'on' ? 'hidden' : ''}`} playsInline muted />
                        <canvas ref={canvasRef} className="hidden" />
                        {capturedImage && <img src={capturedImage} className="w-full h-full object-contain" alt="Captured book cover" />}
                        {cameraState === 'on' && (
                            <button onClick={handleCapture} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 border-4 border-white rounded-full backdrop-blur-sm" aria-label="Take picture"></button>
                        )}
                    </div>
                )}
            </div>
          )}

          {status === 'loading' && <LoadingSpinner text={capturedImage ? "Analyzing cover..." : "Searching..."}/>}
          {status === 'error' && <div className="text-center p-8 text-red-400">{error}</div>}
          {status === 'no-results' && <div className="text-center p-8 text-neutral-400">No books found. Try a different search.</div>}
          
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
        </div>
      </motion.div>
    </div>
  );
};

export default AddBookModal;