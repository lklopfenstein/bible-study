'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './InteractiveVerse.module.css';
import type { BibleVerse } from '@/lib/api';
import VerseActionMenu from './VerseActionMenu';
import InlineStudyContent from './InlineStudyContent';
import DeepStudyDrawer from './DeepStudyDrawer';
import { Bookmark as BookmarkIcon, FileText, Map } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface Props {
  verse: BibleVerse;
  book: string; // Passed from parent to track reference
}

export default function InteractiveVerse({ verse, book }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStudyContentOpen, setIsStudyContentOpen] = useState(false);
  const [studyContentType, setStudyContentType] = useState<'note' | 'map'>('note');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [highlightColor, setHighlightColor] = useState<string>('transparent');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  const containerRef = useRef<HTMLSpanElement>(null);
  const referenceString = `${book.charAt(0).toUpperCase() + book.slice(1)} ${verse.chapter}:${verse.verse}`;

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedHighlight = localStorage.getItem(`highlight-${referenceString}`);
    if (savedHighlight) setHighlightColor(savedHighlight);

    const savedBookmark = localStorage.getItem(`bookmark-${referenceString}`);
    if (savedBookmark) setIsBookmarked(savedBookmark === 'true');

    // Check if there's a note in the global notes array
    const globalNotes = localStorage.getItem('study-bible-notes');
    if (globalNotes) {
      try {
        const parsed = JSON.parse(globalNotes);
        const exists = parsed.some((n: any) => n.reference.toLowerCase() === referenceString.toLowerCase());
        setHasNote(exists);
      } catch (e) {}
    }
  }, [referenceString]);

  const handleHighlight = (color: string) => {
    setHighlightColor(color);
    if (color === 'transparent') {
      localStorage.removeItem(`highlight-${referenceString}`);
    } else {
      localStorage.setItem(`highlight-${referenceString}`, color);
    }
  };

  const handleBookmark = () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    if (newState) {
      localStorage.setItem(`bookmark-${referenceString}`, 'true');
    } else {
      localStorage.removeItem(`bookmark-${referenceString}`);
    }
  };

  const handleAddNote = () => {
    // In a real app, this would open a modal to write the note.
    // For now, we'll just mock saving a note to trigger the indicator.
    const globalNotesStr = localStorage.getItem('study-bible-notes');
    const notes = globalNotesStr ? JSON.parse(globalNotesStr) : [];
    
    notes.push({
      id: Date.now().toString(),
      reference: referenceString,
      text: "Inline note added from reader view.",
      date: new Date().toISOString().split('T')[0]
    });
    
    localStorage.setItem('study-bible-notes', JSON.stringify(notes));
    setHasNote(true);
    alert('Note added! (Check the Notes page)');
  };

  const toggleStudyContent = (type: 'note' | 'map', e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStudyContentOpen && studyContentType === type) {
      setIsStudyContentOpen(false);
    } else {
      setStudyContentType(type);
      setIsStudyContentOpen(true);
    }
  };

  // Mock a map existing for verse 1
  const hasMap = verse.verse === 1;

  return (
    <>
      <span 
        ref={containerRef}
        className={styles.verseWrapper} 
        style={{ backgroundColor: highlightColor !== 'transparent' ? highlightColor : undefined }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isBookmarked && <BookmarkIcon size={12} className={styles.bookmarkIcon} fill="currentColor" />}
        <sup className={styles.verseNumber}>{verse.verse}</sup>
        
        {/* The verse text */}
        <span className={styles.verseText}>{verse.text}</span>
        
        {/* Indicators for inline content */}
        {(hasNote || hasMap) && (
          <span className={styles.indicators}>
            {hasNote && <FileText size={14} className={styles.indicatorIcon} onClick={(e) => toggleStudyContent('note', e)} />}
            {hasMap && <Map size={14} className={styles.indicatorIcon} onClick={(e) => toggleStudyContent('map', e)} />}
          </span>
        )}

        {/* Action Menu Popover */}
        {isMenuOpen && (
          <VerseActionMenu 
            onClose={() => setIsMenuOpen(false)}
            onHighlight={handleHighlight}
            onBookmark={handleBookmark}
            onAddNote={handleAddNote}
            onDeepStudy={() => setIsDrawerOpen(true)}
          />
        )}
      </span>
      
      {/* Inline Expansion (Renders below the verse, breaking the flow elegantly) */}
      {isStudyContentOpen && (
        <span className={styles.inlineContentWrapper}>
          <InlineStudyContent 
            type={studyContentType}
            title={`${referenceString} ${studyContentType === 'note' ? 'Notes' : 'Map'}`}
            content={studyContentType === 'note' ? "These are your personal reflections and study notes for this specific verse, loaded dynamically from localStorage." : "Historical region associated with this verse."}
            onClose={() => setIsStudyContentOpen(false)}
          />
        </span>
      )}

      {/* Deep Study Drawer */}
      <DeepStudyDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        book={book} 
        chapter={verse.chapter} 
        verse={verse.verse} 
        verseText={verse.text}
      />
    </>
  );
}
