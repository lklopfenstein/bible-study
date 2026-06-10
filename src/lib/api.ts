export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapterData {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

const BASE_URL = 'https://bible-api.com';

export async function getChapter(book: string, chapter: number, translation: string = 'web'): Promise<BibleChapterData> {
  const response = await fetch(`${BASE_URL}/${book}+${chapter}?translation=${translation}`, {
    next: { revalidate: 86400 } // Cache for 24 hours
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch bible chapter');
  }
  
  return response.json();
}
