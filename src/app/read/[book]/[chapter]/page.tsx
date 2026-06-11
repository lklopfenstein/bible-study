import { getChapter } from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import InteractiveVerse from '@/components/ui/InteractiveVerse';
import BookSelector from '@/components/ui/BookSelector';
import SaveReadingState from '@/components/ui/SaveReadingState';
import { BIBLE_BOOKS } from '@/lib/bibleData';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;
  
  const chapterNum = parseInt(chapter, 10);
  
  // Fetch data
  const data = await getChapter(book, chapterNum);
  
  // Advanced prev/next chapter logic bridging books
  const normalizedBook = book.toLowerCase().replace(/-/g, '').replace(/ /g, '');
  const bookIndex = BIBLE_BOOKS.findIndex(b => b.name.toLowerCase().replace(/ /g, '') === normalizedBook);
  const currentBookData = bookIndex >= 0 ? BIBLE_BOOKS[bookIndex] : null;

  let prevLink = '';
  let nextLink = '';

  if (currentBookData) {
    if (chapterNum > 1) {
      prevLink = `/read/${book}/${chapterNum - 1}`;
    } else if (bookIndex > 0) {
      const prevBook = BIBLE_BOOKS[bookIndex - 1];
      const pFormat = prevBook.name.toLowerCase().replace(/ /g, '');
      prevLink = `/read/${pFormat}/${prevBook.chapters}`;
    }

    if (chapterNum < currentBookData.chapters) {
      nextLink = `/read/${book}/${chapterNum + 1}`;
    } else if (bookIndex < BIBLE_BOOKS.length - 1) {
      const nextBook = BIBLE_BOOKS[bookIndex + 1];
      const nFormat = nextBook.name.toLowerCase().replace(/ /g, '');
      nextLink = `/read/${nFormat}/1`;
    }
  }

  return (
    <main className={styles.readerContainer}>
      <SaveReadingState book={book} chapter={chapterNum} />
      <div className={styles.controls}>
        {prevLink ? (
          <Link href={prevLink} className={styles.navButton}>
            <ChevronLeft size={24} />
          </Link>
        ) : (
          <div className={styles.navButton} style={{ opacity: 0.3, cursor: 'default' }}>
            <ChevronLeft size={24} />
          </div>
        )}
        
        <BookSelector currentBook={book} currentChapter={chapterNum} />
        
        {nextLink ? (
          <Link href={nextLink} className={styles.navButton}>
            <ChevronRight size={24} />
          </Link>
        ) : (
          <div className={styles.navButton} style={{ opacity: 0.3, cursor: 'default' }}>
            <ChevronRight size={24} />
          </div>
        )}
      </div>

      <article className={styles.scriptureContent}>
        {data.verses.map((verse) => (
          <InteractiveVerse key={verse.verse} verse={verse} book={book} />
        ))}
      </article>
      
      <div className={styles.translationNote}>
        <p>Translation: {data.translation_name}</p>
        <p className={styles.note}>{data.translation_note}</p>
      </div>
    </main>
  );
}
