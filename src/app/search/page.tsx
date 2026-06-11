'use client';

import { useState, useEffect } from 'react';
import localforage from 'localforage';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Database, Search as SearchIcon, Filter, Book, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    }, 300);

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
        return <mark key={i} className="bg-[#b3a37d] text-white px-1 py-0.5 rounded-sm font-semibold shadow-sm">{part}</mark>;
      }
      return part;
    });
  };

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#e5dfd3] border-t-[#8c7a56] rounded-full animate-spin" />
          <p className="text-[#8c7a56] font-medium animate-pulse">Initializing Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#2c2822] mb-3">Concordance</h1>
        <p className="text-[#8c7a56] text-lg max-w-xl mx-auto">Explore scripture with lightning-fast offline search across all 31,102 verses.</p>
      </motion.div>
      
      {!bibleData ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40"
        >
          <div className="w-20 h-20 bg-[#f4f1eb] rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6 shadow-sm">
            <Database className="w-10 h-10 text-[#8c7a56]" />
          </div>
          <h2 className="text-2xl font-serif font-medium text-[#2c2822] mb-3">Offline Database Required</h2>
          <p className="text-[#6b6255] mb-8 max-w-md mx-auto text-lg">
            To perform instantaneous, private full-text searches, please download the free offline database.
          </p>
          <Link 
            href="/settings"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#2c2822] text-white font-medium rounded-2xl hover:bg-[#433d34] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-stone-900/20"
          >
            <Database className="w-5 h-5" /> Download Database
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Stunning Search Bar */}
          <motion.div 
            className="relative group z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#d4c6a9] to-[#ebdcc2] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 p-2 flex flex-col md:flex-row gap-2 transition-all">
              <div className="relative flex-grow flex items-center">
                <SearchIcon className="absolute left-5 w-6 h-6 text-[#a39476]" />
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for faith, love, Jerusalem..."
                  className="w-full bg-transparent pl-14 pr-6 py-4 md:py-5 text-xl font-serif text-[#2c2822] placeholder:text-[#b3a37d] focus:outline-none"
                />
                <AnimatePresence>
                  {isSearching && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute right-6"
                    >
                      <div className="w-6 h-6 border-3 border-[#e5dfd3] border-t-[#8c7a56] rounded-full animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filters inline for desktop */}
              <div className="flex gap-2 p-2 md:p-0 md:pr-2 bg-[#faf9f6] md:bg-transparent rounded-2xl md:rounded-none">
                <div className="relative group/select w-1/2 md:w-auto">
                  <select
                    value={testament}
                    onChange={(e) => setTestament(e.target.value as any)}
                    className="w-full h-full min-h-[48px] pl-4 pr-10 bg-white md:bg-[#f4f1eb] hover:bg-[#ebe6db] transition-colors border-none focus:ring-0 rounded-xl appearance-none text-[#5c5446] font-medium cursor-pointer"
                  >
                    <option value="all">All Bible</option>
                    <option value="ot">Old Testament</option>
                    <option value="nt">New Testament</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39476] pointer-events-none" />
                </div>
                
                <div className="relative group/select w-1/2 md:w-auto">
                  <select
                    value={bookFilter}
                    onChange={(e) => setBookFilter(e.target.value)}
                    className="w-full h-full min-h-[48px] pl-4 pr-10 bg-white md:bg-[#f4f1eb] hover:bg-[#ebe6db] transition-colors border-none focus:ring-0 rounded-xl appearance-none text-[#5c5446] font-medium cursor-pointer"
                  >
                    <option value="all">Any Book</option>
                    {BOOK_NAMES.map(book => (
                      <option key={book} value={book}>{book}</option>
                    ))}
                  </select>
                  <Book className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39476] pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="px-2">
            <AnimatePresence mode="wait">
              {query.trim().length > 0 && query.trim().length < 3 ? (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-3 py-12 text-[#a39476]"
                >
                  <AlertCircle className="w-5 h-5" /> 
                  <span className="text-lg">Please enter at least 3 characters.</span>
                </motion.div>
              ) : results.length === 0 && query.trim().length >= 3 && !isSearching ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 text-center"
                >
                  <div className="w-16 h-16 bg-[#f4f1eb] rounded-full flex items-center justify-center mx-auto mb-4 text-[#b3a37d]">
                    <SearchIcon className="w-8 h-8 opacity-50" />
                  </div>
                  <h3 className="text-xl font-serif text-[#5c5446] mb-2">No verses found</h3>
                  <p className="text-[#a39476]">Try adjusting your spelling or filters.</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-6 text-sm text-[#8c7a56] px-2 font-medium"
              >
                <span>{results.length}{results.length === 100 ? '+' : ''} matches found</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {searchTime.toFixed(0)}ms</span>
              </motion.div>
            )}

            <div className="grid gap-4">
              <AnimatePresence>
                {results.map((res, i) => (
                  <motion.div
                    key={`${res.book}-${res.chapter}-${res.verse}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.4 }}
                  >
                    <Link 
                      href={`/read/${res.book.toLowerCase().replace(/ /g, '-')}/${res.chapter}#v${res.verse}`}
                      className="group block bg-white rounded-2xl p-6 shadow-sm border border-[#ebe6db] hover:border-[#d4c6a9] hover:shadow-lg hover:shadow-[#d4c6a9]/20 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-serif font-semibold text-[#8c7a56] bg-[#f4f1eb] px-3 py-1 rounded-lg text-sm group-hover:bg-[#d4c6a9] group-hover:text-white transition-colors">
                          {res.book} {res.chapter}:{res.verse}
                        </span>
                        <ArrowRight className="w-5 h-5 text-[#d4c6a9] group-hover:text-[#8c7a56] group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-[#2c2822] font-serif text-lg leading-relaxed group-hover:text-black transition-colors">
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
