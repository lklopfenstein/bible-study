'use client';

import { useState, useEffect } from 'react';
import styles from './InteractiveVerse.module.css';
import type { BibleVerse } from '@/lib/api';
import { Bookmark as BookmarkIcon, FileText, Map } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

interface Props {
  verse: BibleVerse;
  book: string;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export default function InteractiveVerse({ verse, book, isSelected, onToggleSelect }: Props) {
  const [highlightColor, setHighlightColor] = useState<string>('transparent');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  const { user, supabase } = useUser();
  const referenceString = `${book.charAt(0).toUpperCase() + book.slice(1)} ${verse.chapter}:${verse.verse}`;

  const loadState = async () => {
    // Local Fallback first
    const savedHighlight = localStorage.getItem(`highlight-${referenceString}`);
    if (savedHighlight) setHighlightColor(savedHighlight);
    else setHighlightColor('transparent');

    const savedBookmark = localStorage.getItem(`bookmark-${referenceString}`);
    if (savedBookmark) setIsBookmarked(savedBookmark === 'true');
    else setIsBookmarked(false);

    const globalNotes = localStorage.getItem('study-bible-notes');
    if (globalNotes) {
      try {
        const parsed = JSON.parse(globalNotes);
        const noteObj = parsed.find((n: any) => n.reference.toLowerCase() === referenceString.toLowerCase());
        if (noteObj) setHasNote(true);
        else setHasNote(false);
      } catch (e) {}
    } else {
      setHasNote(false);
    }

    // Cloud Override if logged in
    if (user) {
      const { data } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('book', book)
        .eq('chapter', verse.chapter)
        .eq('verse', verse.verse);
      
      if (data && data.length > 0) {
        const highlight = data.find(d => d.type === 'highlight');
        if (highlight) setHighlightColor(highlight.color || 'transparent');
        
        const bookmark = data.find(d => d.type === 'bookmark');
        if (bookmark) setIsBookmarked(true);

        const note = data.find(d => d.type === 'note');
        if (note) setHasNote(true);
      }
    }
  };

  useEffect(() => {
    loadState();

    const handleUpdate = () => loadState();
    window.addEventListener('highlights-updated', handleUpdate);
    window.addEventListener('bookmarks-updated', handleUpdate);
    window.addEventListener('notes-updated', handleUpdate);

    return () => {
      window.removeEventListener('highlights-updated', handleUpdate);
      window.removeEventListener('bookmarks-updated', handleUpdate);
      window.removeEventListener('notes-updated', handleUpdate);
    };
  }, [referenceString, user, supabase, book, verse]);

  const hasMap = verse.verse === 1;

  return (
    <span 
      className={`${styles.verseWrapper} ${isSelected ? styles.selected : ''}`} 
      style={{ backgroundColor: highlightColor !== 'transparent' && !isSelected ? highlightColor : undefined }}
      onClick={onToggleSelect}
    >
      {isBookmarked && <BookmarkIcon size={12} className={styles.bookmarkIcon} fill="currentColor" />}
      <sup className={styles.verseNumber}>{verse.verse}</sup>
      
      <span className={styles.verseText}>{verse.text}</span>
      
      {(hasNote || hasMap) && (
        <span className={styles.indicators}>
          {hasNote && <FileText size={14} className={styles.indicatorIcon} />}
          {hasMap && <Map size={14} className={styles.indicatorIcon} />}
        </span>
      )}
    </span>
  );
}
