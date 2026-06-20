import { getChapter } from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import ScriptureContent from '@/components/ui/ScriptureContent';
import BookSelector from '@/components/ui/BookSelector';
import SaveReadingState from '@/components/ui/SaveReadingState';
import VersionSelector from '@/components/ui/VersionSelector';
import AudioPlayer from '@/components/ui/AudioPlayer';
import GrantXp from '@/components/ui/GrantXp';
import { BIBLE_BOOKS } from '@/lib/bibleData';

export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { book, chapter } = await params;
  const { v } = await searchParams;
  const currentVersion = v || 'web';
  
  const chapterNum = parseInt(chapter, 10);
  
  // Fetch data
  const data = await getChapter(book, chapterNum, currentVersion);
  
  // Advanced prev/next chapter logic bridging books
  const normalizedBook = book.toLowerCase().replace(/-/g, '').replace(/ /g, '');
  const bookIndex = BIBLE_BOOKS.findIndex(b => b.name.toLowerCase().replace(/ /g, '') === normalizedBook);
  const currentBookData = bookIndex >= 0 ? BIBLE_BOOKS[bookIndex] : null;

  let prevLink = '';
  let nextLink = '';

  if (currentBookData) {
    if (chapterNum > 1) {
      prevLink = `/read/${book}/${chapterNum - 1}?v=${currentVersion}`;
    } else if (bookIndex > 0) {
      const prevBook = BIBLE_BOOKS[bookIndex - 1];
      const pFormat = prevBook.name.toLowerCase().replace(/ /g, '');
      prevLink = `/read/${pFormat}/${prevBook.chapters}?v=${currentVersion}`;
    }

    if (chapterNum < currentBookData.chapters) {
      nextLink = `/read/${book}/${chapterNum + 1}?v=${currentVersion}`;
    } else if (bookIndex < BIBLE_BOOKS.length - 1) {
      const nextBook = BIBLE_BOOKS[bookIndex + 1];
      const nFormat = nextBook.name.toLowerCase().replace(/ /g, '');
      nextLink = `/read/${nFormat}/1?v=${currentVersion}`;
    }
  }

  return (
    <main className={styles.readerContainer}>
      <SaveReadingState book={book} chapter={chapterNum} />
      <GrantXp amount={10} reason="Read a chapter" />
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
        <VersionSelector />
        <AudioPlayer text={data.verses.map(v => v.text).join(' ')} nextLink={nextLink} />
        
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
        <ScriptureContent verses={data.verses} book={book} />
      </article>
      
      <div className={styles.translationNote}>
        <p>Translation: {data.translation_name}</p>
        <p className={styles.note}>{data.translation_note}</p>
      </div>
    </main>
  );
}
