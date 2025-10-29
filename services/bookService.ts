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
