'use client';

import { useState } from 'react';
import type { BibleVerse } from '@/lib/api';
import InteractiveVerse from './InteractiveVerse';
import GlobalActionBar from './GlobalActionBar';
import DeepStudyDrawer from './DeepStudyDrawer';
import InlineStudyContent from './InlineStudyContent';
import { useUser } from '@/hooks/useUser';

interface Props {
  verses: BibleVerse[];
  book: string;
}

export default function ScriptureContent({ verses, book }: Props) {
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  
  const { user, supabase } = useUser();

  const handleToggleSelect = (verseNum: number) => {
    setSelectedVerses(prev => {
      if (prev.includes(verseNum)) {
        return prev.filter(v => v !== verseNum);
      } else {
        return [...prev, verseNum].sort((a, b) => a - b);
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedVerses([]);
    setIsNoteEditorOpen(false);
  };

  const handleDeepStudy = () => {
    setIsDrawerOpen(true);
  };

  const handleOpenNote = () => {
    setIsNoteEditorOpen(true);
  };

  const handleHighlight = async (color: string) => {
    // Implement global highlight logic here, or pass it down.
    // For simplicity, we can let GlobalActionBar handle the DB calls or we handle them here.
    if (selectedVerses.length === 0) return;
    
    // In a real app, we'd update state or let a context refetch. 
    // Here we can reload the page or trigger a re-render by clearing selection.
    for (const verseNum of selectedVerses) {
      const referenceString = `${book.charAt(0).toUpperCase() + book.slice(1)} ${verses[0].chapter}:${verseNum}`;
      
      if (color === 'transparent') {
        localStorage.removeItem(`highlight-${referenceString}`);
        if (user) {
          await supabase.from('user_data').delete()
            .match({ user_id: user.id, book, chapter: verses[0].chapter, verse: verseNum, type: 'highlight' });
        }
      } else {
        localStorage.setItem(`highlight-${referenceString}`, color);
        if (user) {
          await supabase.from('user_data').delete()
            .match({ user_id: user.id, book, chapter: verses[0].chapter, verse: verseNum, type: 'highlight' });
          await supabase.from('user_data').insert({
            user_id: user.id, book, chapter: verses[0].chapter, verse: verseNum, type: 'highlight', color
          });
        }
      }
    }
    
    // Dispatch an event so InteractiveVerse instances can update
    window.dispatchEvent(new Event('highlights-updated'));
    handleClearSelection();
  };

  const handleBookmark = async () => {
    for (const verseNum of selectedVerses) {
      const referenceString = `${book.charAt(0).toUpperCase() + book.slice(1)} ${verses[0].chapter}:${verseNum}`;
      localStorage.setItem(`bookmark-${referenceString}`, 'true');
      if (user) {
        await supabase.from('user_data').delete()
          .match({ user_id: user.id, book, chapter: verses[0].chapter, verse: verseNum, type: 'bookmark' });
        await supabase.from('user_data').insert({
          user_id: user.id, book, chapter: verses[0].chapter, verse: verseNum, type: 'bookmark'
        });
      }
    }
    window.dispatchEvent(new Event('bookmarks-updated'));
    handleClearSelection();
  };

  // Generate combined verse text for Deep Study
  const selectedVersesData = verses.filter(v => selectedVerses.includes(v.verse));
  const combinedText = selectedVersesData.map(v => v.text).join(' ');
  const firstSelectedVerse = selectedVersesData[0]?.verse || 1;
  const rangeString = selectedVerses.length > 1 
    ? `${selectedVerses[0]}-${selectedVerses[selectedVerses.length - 1]}`
    : `${firstSelectedVerse}`;

  const referenceString = `${book.charAt(0).toUpperCase() + book.slice(1)} ${verses[0]?.chapter}:${rangeString}`;

  return (
    <>
      {verses.map((verse) => (
        <InteractiveVerse 
          key={verse.verse} 
          verse={verse} 
          book={book} 
          isSelected={selectedVerses.includes(verse.verse)}
          onToggleSelect={() => handleToggleSelect(verse.verse)}
        />
      ))}

      {isNoteEditorOpen && (
        <div style={{ marginTop: '20px' }}>
          <InlineStudyContent 
            type="note"
            title={`${referenceString} Notes`}
            initialContent=""
            onClose={() => setIsNoteEditorOpen(false)}
            onSaveNote={async (text) => {
              // Save note to the first selected verse
              const targetVerse = selectedVerses[0];
              const singleRef = `${book.charAt(0).toUpperCase() + book.slice(1)} ${verses[0].chapter}:${targetVerse}`;
              
              const globalNotesStr = localStorage.getItem('study-bible-notes');
              let notes = globalNotesStr ? JSON.parse(globalNotesStr) : [];
              notes = notes.filter((n: any) => n.reference.toLowerCase() !== singleRef.toLowerCase());
              
              if (text.trim() !== '') {
                notes.push({
                  id: Date.now().toString(),
                  reference: singleRef,
                  text: text,
                  date: new Date().toISOString().split('T')[0]
                });
              }
              localStorage.setItem('study-bible-notes', JSON.stringify(notes));

              if (user) {
                await supabase.from('user_data').delete()
                  .match({ user_id: user.id, book, chapter: verses[0].chapter, verse: targetVerse, type: 'note' });
                if (text.trim() !== '') {
                  await supabase.from('user_data').insert({
                    user_id: user.id, book, chapter: verses[0].chapter, verse: targetVerse, type: 'note', content: text
                  });
                }
              }
              
              window.dispatchEvent(new Event('notes-updated'));
              setIsNoteEditorOpen(false);
              handleClearSelection();
            }}
          />
        </div>
      )}

      {selectedVerses.length > 0 && !isDrawerOpen && !isNoteEditorOpen && (
        <GlobalActionBar 
          selectedCount={selectedVerses.length}
          onClear={handleClearSelection}
          onHighlight={handleHighlight}
          onBookmark={handleBookmark}
          onNote={handleOpenNote}
          onDeepStudy={handleDeepStudy}
        />
      )}

      <DeepStudyDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        book={book} 
        chapter={verses[0]?.chapter || 1} 
        verse={firstSelectedVerse} 
        verseText={combinedText}
      />
    </>
  );
}
