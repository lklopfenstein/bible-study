import { getChapter } from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import InteractiveVerse from '@/components/ui/InteractiveVerse';
import BookSelector from '@/components/ui/BookSelector';
import SaveReadingState from '@/components/ui/SaveReadingState';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book, chapter } = await params;
  
  const chapterNum = parseInt(chapter, 10);
  
  // Fetch data
  const data = await getChapter(book, chapterNum);
  
  // Very basic prev/next chapter logic (won't handle book boundaries perfectly without a full index, but works for demo)
  const prevChapter = chapterNum > 1 ? chapterNum - 1 : 1;
  const nextChapter = chapterNum + 1;

  return (
    <main className={styles.readerContainer}>
      <SaveReadingState book={book} chapter={chapterNum} />
      <div className={styles.controls}>
        <Link href={`/read/${book}/${prevChapter}`} className={styles.navButton}>
          <ChevronLeft size={24} />
        </Link>
        
        <BookSelector currentBook={book} currentChapter={chapterNum} />
        
        <Link href={`/read/${book}/${nextChapter}`} className={styles.navButton}>
          <ChevronRight size={24} />
        </Link>
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
