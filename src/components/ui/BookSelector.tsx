'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, BookOpen } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import styles from './BookSelector.module.css';

// A sample list of books for demonstration. 
const books = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 
  'Psalms', 'Proverbs', 'Isaiah', 
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Revelation'
];

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
    router.push(`/read/${selectedBook.toLowerCase()}/${selectedChapter}`);
  };

  // Utility to generate chapters 1-150 for demo purposes (max Psalms)
  const chapters = Array.from({ length: selectedBook === 'Psalms' ? 150 : 50 }, (_, i) => i + 1);

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
                {books.map(b => (
                  <option key={b} value={b}>{b}</option>
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
