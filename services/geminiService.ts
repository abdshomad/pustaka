/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface BookDetails {
  title: string;
  author: string;
}

/**
 * Identifies a book's title and author from an image of its cover.
 * @param imageDataUrl A data URL string of the source image.
 * @returns A promise that resolves to an object containing the book's title and author.
 */
export async function identifyBookFromImage(imageDataUrl: string): Promise<BookDetails> {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
  }
  const [, mimeType, base64Data] = match;

  const imagePart = {
    inlineData: { mimeType, data: base64Data },
  };
  const textPart = { text: "Identify the book's title and author from this image. The image could be of the book cover or a barcode (like an ISBN). If you cannot identify a book, respond with an empty title and author." };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The title of the book."
            },
            author: {
              type: Type.STRING,
              description: "The primary author of the book."
            },
          },
        },
      },
    });

    const jsonString = response.text;
    const result: BookDetails = JSON.parse(jsonString);
    
    if (!result.title) {
      throw new Error("Could not identify a book from the image.");
    }
    return result;
  } catch (error) {
      console.error("Error calling Gemini API for book identification:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      if (errorMessage.includes("Could not identify")) {
        throw new Error("The AI could not identify a book from the provided image. Please try a clearer picture.");
      }
      throw new Error(`Failed to analyze book cover. Details: ${errorMessage}`);
  }
}