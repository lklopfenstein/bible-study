'use client';

import { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Database, Search as SearchIcon, Filter, Book, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Search.module.css';

export const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter',
  '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [testament, setTestament] = useState<'all' | 'ot' | 'nt'>('all');
  const [bookFilter, setBookFilter] = useState('all');
  
  const [bibleData, setBibleData] = useState<any[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localforage.getItem('bible_data_web').then((data: any) => {
      if (data && Array.isArray(data)) {
        setBibleData(data);
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!bibleData || query.trim().length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    const delayDebounceFn = setTimeout(() => {
      const startTime = performance.now();
      const searchTerms = query.toLowerCase().split(' ').filter(t => t.trim() !== '');
      const matched: SearchResult[] = [];
      
      for (let bIndex = 0; bIndex < bibleData.length; bIndex++) {
        const bookName = BOOK_NAMES[bIndex];
        
        if (bookFilter !== 'all' && bookName !== bookFilter) continue;
        if (testament === 'ot' && bIndex > 38) continue;
        if (testament === 'nt' && bIndex <= 38) continue;

        const bookData = bibleData[bIndex];
        const chapters = bookData.chapters;
        
        if (!chapters) continue;

        for (let cIndex = 0; cIndex < chapters.length; cIndex++) {
          const chapterData = chapters[cIndex];
          for (let vIndex = 0; vIndex < chapterData.length; vIndex++) {
            const verseText = chapterData[vIndex];
            const lowerVerseText = verseText.toLowerCase();
            
            const isMatch = searchTerms.every(term => lowerVerseText.includes(term));
            
            if (isMatch) {
              matched.push({
                book: bookName,
                chapter: cIndex + 1,
                verse: vIndex + 1,
                text: verseText
              });
              
              if (matched.length >= 100) {
                setResults(matched);
                setSearchTime(performance.now() - startTime);
                setIsSearching(false);
                return;
              }
            }
          }
        }
      }
      
      setResults(matched);
      setSearchTime(performance.now() - startTime);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query, testament, bookFilter, bibleData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      window.history.replaceState({}, '', '/search');
    }
  }, []);

  const highlightText = (text: string) => {
    if (!query.trim()) return text;
    const terms = query.toLowerCase().split(' ').filter(t => t.trim() !== '');
    if (terms.length === 0) return text;
    
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (terms.includes(part.toLowerCase())) {
        return <span key={i} className={styles.highlight}>{part}</span>;
      }
      return part;
    });
  };

  if (!isLoaded) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.messageBox} style={{ border: 'none', background: 'transparent' }}>
          <Loader2 size={32} className={styles.spin} style={{ color: 'var(--text-accent)' }} />
          <p>Initializing Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.hero}
      >
        <h1 className={styles.title}>Global Search</h1>
        <p className={styles.subtitle}>
          Search 31,102 verses in milliseconds. Experience the entire Bible at your fingertips.
        </p>
      </motion.div>
      
      {!bibleData ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.offlineCard}
        >
          <div className={styles.offlineIcon}>
            <Database size={32} />
          </div>
          <h2 className={styles.offlineTitle}>Offline Database Required</h2>
          <p className={styles.offlineText}>
            To perform instantaneous full-text queries, you need to download the offline database.
          </p>
          <Link href="/settings" className={styles.downloadBtn}>
            <Database size={20} /> Download Database
          </Link>
        </motion.div>
      ) : (
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.searchBarContainer}
          >
            <div className={styles.inputWrapper}>
              <SearchIcon size={24} className={styles.searchIcon} />
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for faith, love, Jerusalem..."
                className={styles.searchInput}
                autoComplete="off"
              />
              <AnimatePresence>
                {isSearching && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={styles.spinnerWrapper}
                  >
                    <Loader2 size={24} className={styles.spin} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.filters}>
              <div className={styles.selectWrapper}>
                <select
                  value={testament}
                  onChange={(e) => setTestament(e.target.value as any)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Bible</option>
                  <option value="ot">Old Testament</option>
                  <option value="nt">New Testament</option>
                </select>
                <Filter size={16} className={styles.filterIcon} />
              </div>
              
              <div className={styles.selectWrapper}>
                <select
                  value={bookFilter}
                  onChange={(e) => setBookFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">Any Book</option>
                  {BOOK_NAMES.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
                <Book size={16} className={styles.filterIcon} />
              </div>
            </div>
          </motion.div>

          <div>
            <AnimatePresence mode="wait">
              {query.trim().length > 0 && query.trim().length < 3 ? (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.messageBox}
                >
                  <AlertCircle size={20} /> 
                  <span>Keep typing... at least 3 characters.</span>
                </motion.div>
              ) : results.length === 0 && query.trim().length >= 3 && !isSearching ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={styles.messageBox}
                  style={{ flexDirection: 'column', padding: '4rem 2rem' }}
                >
                  <SearchIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <h3 className={styles.messageTitle}>Zero Matches Found</h3>
                  <p>Try adjusting your spelling or widening your filters.</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.metaBar}
              >
                <span>
                  <strong>{results.length}{results.length === 100 ? '+' : ''}</strong> matches found
                </span>
                <span className={styles.timeTag}>
                  <Zap size={14} /> {searchTime.toFixed(0)}ms
                </span>
              </motion.div>
            )}

            <div className={styles.resultsGrid}>
              <AnimatePresence>
                {results.map((res, i) => (
                  <motion.div
                    key={`${res.book}-${res.chapter}-${res.verse}-${i}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                  >
                    <Link 
                      href={`/read/${res.book.toLowerCase().replace(/ /g, '-')}/${res.chapter}#v${res.verse}`}
                      className={styles.resultCard}
                    >
                      <div className={styles.cardHeader}>
                        <span className={styles.referenceBadge}>
                          {res.book} {res.chapter}:{res.verse}
                        </span>
                        <ArrowRight size={20} className={styles.arrowIcon} />
                      </div>
                      <p className={styles.verseText}>
                        {highlightText(res.text)}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
