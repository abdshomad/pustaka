/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export const translations = {
  en: {
    // App.tsx
    appTitle: 'Digital Bookshelf',
    appSubtitle: 'Your personal collection, always with you.',
    sortBy: 'Sort by:',
    sortDate: 'Date Added',
    sortTitle: 'Title',
    sortAuthor: 'Author',
    emptyStateLoading: 'Finding popular books...',
    emptyStateLoadingSubtitle: 'Curating a list of bestsellers for you.',
    emptyStateTitle: 'Your Bookshelf is Empty',
    emptyStateSubtitle: 'Get started by adding some of these popular books.',
    emptyStateFallbackTitle: 'Your bookshelf is empty',
    emptyStateFallbackSubtitle: "Click the '+' button to add your first book.",
    addNewBook: 'Add new book',
    popularBooksError: 'Could not load popular books at this time.',

    // BookCard.tsx
    ariaRemoveBook: 'Remove {title} from library',
    ariaBookInLibrary: '{title} is in your library',
    ariaAddBook: 'Add {title} to library',
    ariaViewDetails: 'View details for {title}',

    // BookDetailModal.tsx
    isbn: 'ISBN',
    description: 'Description',
    close: 'Close',

    // AddBookModal.tsx
    searchTab: 'Search Text',
    scanTab: 'Scan Cover',
    searchPlaceholder: 'Search by Title, Author, or ISBN...',
    searchButton: 'Search',
    cameraStarting: 'Starting camera...',
    captureTooltip: 'Take picture',
    scanning: 'Scanning & Adding...',
    scannedSession: 'Scanned This Session',
    scanInstructions: 'Point your camera at a book cover and tap the button to add it.',
    add: 'Add',
    added: 'Added',
    inLibrary: 'IN LIBRARY',
    noResults: 'No books found. Try a different search.',

    // Footer.tsx
    bookCount: '{count} book in library', // special handling in context for plural
  },
  id: {
    // App.tsx
    appTitle: 'Rak Buku Digital',
    appSubtitle: 'Koleksi pribadi Anda, selalu bersama Anda.',
    sortBy: 'Urutkan berdasarkan:',
    sortDate: 'Tanggal Ditambahkan',
    sortTitle: 'Judul',
    sortAuthor: 'Penulis',
    emptyStateLoading: 'Mencari buku populer...',
    emptyStateLoadingSubtitle: 'Menyusun daftar buku terlaris untuk Anda.',
    emptyStateTitle: 'Rak Buku Anda Kosong',
    emptyStateSubtitle: 'Mulai dengan menambahkan beberapa buku populer ini.',
    emptyStateFallbackTitle: 'Rak buku Anda kosong',
    emptyStateFallbackSubtitle: "Klik tombol '+' untuk menambahkan buku pertama Anda.",
    addNewBook: 'Tambah buku baru',
    popularBooksError: 'Tidak dapat memuat buku populer saat ini.',

    // BookCard.tsx
    ariaRemoveBook: 'Hapus {title} dari perpustakaan',
    ariaBookInLibrary: '{title} ada di perpustakaan Anda',
    ariaAddBook: 'Tambahkan {title} ke perpustakaan',
    ariaViewDetails: 'Lihat detail untuk {title}',

    // BookDetailModal.tsx
    isbn: 'ISBN',
    description: 'Deskripsi',
    close: 'Tutup',

    // AddBookModal.tsx
    searchTab: 'Cari Teks',
    scanTab: 'Pindai Sampul',
    searchPlaceholder: 'Cari berdasarkan Judul, Penulis, atau ISBN...',
    searchButton: 'Cari',
    cameraStarting: 'Memulai kamera...',
    captureTooltip: 'Ambil gambar',
    scanning: 'Memindai & Menambahkan...',
    scannedSession: 'Dipindai Sesi Ini',
    scanInstructions: 'Arahkan kamera Anda ke sampul buku dan ketuk tombol untuk menambahkannya.',
    add: 'Tambah',
    added: 'Ditambahkan',
    inLibrary: 'DI PERPUSTAKAAN',
    noResults: 'Tidak ada buku yang ditemukan. Coba pencarian lain.',
    
    // Footer.tsx
    bookCount: '{count} buku di perpustakaan',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en'];