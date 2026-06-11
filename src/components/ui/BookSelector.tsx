'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, BookOpen } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { BIBLE_BOOKS } from '@/lib/bibleData';
import styles from './BookSelector.module.css';

interface Props {
  currentBook: string;
  currentChapter: number;
}

export default function BookSelector({ currentBook, currentChapter }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(currentBook);
  const [selectedChapter, setSelectedChapter] = useState(currentChapter.toString());
  
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleNavigate = () => {
    setIsOpen(false);
    // Replace spaces with hyphens or handle appropriately for routing
    // e.g., '1 Corinthians' -> '1-corinthians' depending on how the API expects it
    const formattedBook = selectedBook.toLowerCase().replace(/ /g, '');
    router.push(`/read/${formattedBook}/${selectedChapter}`);
  };

  const selectedBookData = BIBLE_BOOKS.find(b => b.name === selectedBook) || BIBLE_BOOKS[0];
  const chapters = Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.triggerButton} onClick={() => setIsOpen(!isOpen)}>
        <BookOpen size={20} />
        <span className={styles.triggerText}>
          {currentBook.charAt(0).toUpperCase() + currentBook.slice(1)} {currentChapter}
        </span>
        <ChevronDown size={20} className={isOpen ? styles.iconOpen : styles.iconClosed} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.selectors}>
            <div className={styles.listSection}>
              <h4>Book</h4>
              <select 
                size={8} 
                className={styles.list}
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setSelectedChapter('1');
                }}
              >
                {BIBLE_BOOKS.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.listSection}>
              <h4>Chapter</h4>
              <select 
                size={8} 
                className={styles.list}
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
              >
                {chapters.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button className={styles.navButton} onClick={handleNavigate}>
            Go
          </button>
        </div>
      )}
    </div>
  );
}
