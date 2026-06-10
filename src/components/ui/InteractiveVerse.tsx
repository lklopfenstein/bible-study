'use client';

import { useState } from 'react';
import styles from './InteractiveVerse.module.css';
import type { BibleVerse } from '@/lib/api';

interface Props {
  verse: BibleVerse;
}

export default function InteractiveVerse({ verse }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Split text to find random words to "highlight" for demonstration of embedded items
  // In a real app, this data would come from a database mapping words to study notes
  const words = verse.text.split(' ');
  
  return (
    <span className={styles.verseWrapper}>
      <sup className={styles.verseNumber}>{verse.verse}</sup>
      {words.map((word, i) => {
        // Randomly highlight some words (e.g. starting with capital letters, longer than 5 chars) just to show the UX
        const isHighlight = word.length > 6 && i % 3 === 0;
        
        if (isHighlight) {
          return (
            <span key={i} className={styles.highlightWord} onClick={() => setIsOpen(true)}>
              {word}{' '}
              {isOpen && (
                <div className={styles.popover} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.popoverHeader}>
                    <strong>Study Note: {word.replace(/[^\w]/g, '')}</strong>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>✕</button>
                  </div>
                  <p>Historical context and deep meaning for this specific word or phrase would appear here, seamlessly embedded in the text.</p>
                </div>
              )}
            </span>
          );
        }
        return <span key={i}>{word} </span>;
      })}
    </span>
  );
}
