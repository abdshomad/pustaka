/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Book {
  key: string;
  title: string;
  author: string;
  coverUrl: string;
  isbn?: string;
  description?: string;
}

/**
 * Searches for books using the Open Library API.
 * @param query The search query (title, author, ISBN).
 * @returns A promise that resolves to an array of Book objects.
 */
export async function searchBooks(query: string): Promise<Book[]> {
  if (!query) return [];

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,cover_i,isbn`);
    if (!response.ok) {
        throw new Error(`Open Library API responded with status: ${response.status}`);
    }
    const data = await response.json();

    // Filter out books without a cover and map to our Book interface
    return data.docs
        .filter((doc: any) => doc.cover_i)
        .map((doc: any): Book => ({
            key: doc.key,
            title: doc.title,
            author: doc.author_name?.[0] || 'Unknown Author',
            coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
            isbn: doc.isbn?.[0],
        }));
  } catch(error) {
      console.error("Failed to search books:", error);
      throw new Error("There was an issue searching for books. Please check your connection and try again.");
  }
}

/**
 * Fetches a book's description from the Open Library Works API.
 * @param bookKey The key of the book work (e.g., /works/OL...).
 * @returns A promise that resolves to the book's description string.
 */
export async function getBookDescription(bookKey: string): Promise<string> {
    if (!bookKey || !bookKey.startsWith('/works/')) {
        console.warn('Invalid book key for details fetching:', bookKey);
        return 'Description not available for this entry.';
    }
    try {
        const response = await fetch(`https://openlibrary.org${bookKey}.json`);
        if (!response.ok) {
            throw new Error(`Open Library Works API responded with status: ${response.status}`);
        }
        const data = await response.json();

        let description = 'No description available.';
        if (data.description) {
            if (typeof data.description === 'string') {
                description = data.description;
            } else if (typeof data.description === 'object' && data.description.value) {
                description = data.description.value;
            }
        }
        
        // Clean up common OpenLibrary description artifacts
        description = description.replace(/\[\d+\]/g, '') // remove citation marks like [1]
                                 .replace(/- - - - - - - - - - - - - - -/g, '') // remove divider lines
                                 .replace(/\/\*.*?\*\//g, '') // remove /* */ comments
                                 .trim();

        return description;
    } catch (error) {
        console.error(`Failed to get book description for key ${bookKey}:`, error);
        return 'Could not load description.';
    }
}
