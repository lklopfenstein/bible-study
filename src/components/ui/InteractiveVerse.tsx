'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './InteractiveVerse.module.css';
import type { BibleVerse } from '@/lib/api';
import VerseActionMenu from './VerseActionMenu';
import InlineStudyContent from './InlineStudyContent';
import DeepStudyDrawer from './DeepStudyDrawer';
import { Bookmark as BookmarkIcon, FileText, Map } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useUser } from '@/hooks/useUser';

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
  const [noteContent, setNoteContent] = useState('');

  const { user, supabase } = useUser();

  const containerRef = useRef<HTMLSpanElement>(null);
  const referenceString = `${book.charAt(0).toUpperCase() + book.slice(1)} ${verse.chapter}:${verse.verse}`;

  // Load saved state from localStorage AND Supabase on mount
  useEffect(() => {
    const loadState = async () => {
      // Local Fallback first
      const savedHighlight = localStorage.getItem(`highlight-${referenceString}`);
      if (savedHighlight) setHighlightColor(savedHighlight);

      const savedBookmark = localStorage.getItem(`bookmark-${referenceString}`);
      if (savedBookmark) setIsBookmarked(savedBookmark === 'true');

      const globalNotes = localStorage.getItem('study-bible-notes');
      if (globalNotes) {
        try {
          const parsed = JSON.parse(globalNotes);
          const noteObj = parsed.find((n: any) => n.reference.toLowerCase() === referenceString.toLowerCase());
          if (noteObj) {
            setHasNote(true);
            setNoteContent(noteObj.text || '');
          }
        } catch (e) {}
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
          if (note) {
            setHasNote(true);
            setNoteContent(note.content || '');
          }
        }
      }
    };

    loadState();
  }, [referenceString, user, supabase, book, verse]);

  const handleHighlight = async (color: string) => {
    setHighlightColor(color);
    
    if (color === 'transparent') {
      localStorage.removeItem(`highlight-${referenceString}`);
      if (user) {
        await supabase.from('user_data').delete()
          .match({ user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'highlight' });
      }
    } else {
      localStorage.setItem(`highlight-${referenceString}`, color);
      if (user) {
        // Delete old highlight first to avoid duplicates
        await supabase.from('user_data').delete()
          .match({ user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'highlight' });
        await supabase.from('user_data').insert({
          user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'highlight', color
        });
      }
    }
  };

  const handleBookmark = async () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    if (newState) {
      localStorage.setItem(`bookmark-${referenceString}`, 'true');
      if (user) {
        await supabase.from('user_data').insert({
          user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'bookmark'
        });
      }
    } else {
      localStorage.removeItem(`bookmark-${referenceString}`);
      if (user) {
        await supabase.from('user_data').delete()
          .match({ user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'bookmark' });
      }
    }
  };

  const handleAddNote = () => {
    setIsMenuOpen(false);
    setStudyContentType('note');
    setIsStudyContentOpen(true);
  };

  const handleSaveNote = async (text: string) => {
    setNoteContent(text);
    
    // Save locally
    const globalNotesStr = localStorage.getItem('study-bible-notes');
    let notes = globalNotesStr ? JSON.parse(globalNotesStr) : [];
    
    // Remove existing note for this verse if it exists
    notes = notes.filter((n: any) => n.reference.toLowerCase() !== referenceString.toLowerCase());
    
    if (text.trim() !== '') {
      notes.push({
        id: Date.now().toString(),
        reference: referenceString,
        text: text,
        date: new Date().toISOString().split('T')[0]
      });
      setHasNote(true);
    } else {
      setHasNote(false);
    }
    
    localStorage.setItem('study-bible-notes', JSON.stringify(notes));

    // Save to Cloud
    if (user) {
      if (text.trim() !== '') {
        // Upsert by deleting first
        await supabase.from('user_data').delete()
          .match({ user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'note' });
        await supabase.from('user_data').insert({
          user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'note', content: text
        });
      } else {
        await supabase.from('user_data').delete()
          .match({ user_id: user.id, book, chapter: verse.chapter, verse: verse.verse, type: 'note' });
      }
    }
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
            initialContent={studyContentType === 'note' ? noteContent : "Historical region associated with this verse."}
            onClose={() => setIsStudyContentOpen(false)}
            onSaveNote={studyContentType === 'note' ? handleSaveNote : undefined}
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
