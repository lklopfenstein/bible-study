'use client';

import { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Database, Search as SearchIcon, Filter, Book, Zap, ChevronDown } from 'lucide-react';
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
        return <mark key={i} className="bg-[#6b21a8]/20 text-[#9333ea] px-1.5 py-0.5 rounded-md font-bold shadow-[0_0_10px_rgba(147,51,234,0.3)]">{part}</mark>;
      }
      return part;
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0f172a]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#1e293b] rounded-full"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-[#8b5cf6] border-r-[#8b5cf6] rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-[#8b5cf6] font-medium tracking-widest text-sm uppercase animate-pulse">Initializing Core Engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3b0764] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#172554] rounded-full mix-blend-screen filter blur-[120px] opacity-40"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#a78bfa] text-sm font-semibold tracking-wider uppercase mb-6 shadow-xl backdrop-blur-md">
            <Zap className="w-4 h-4" /> Lightning Fast Scripture Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 mb-6 drop-shadow-sm">
            Global Search
          </h1>
          <p className="text-[#94a3b8] text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Search 31,102 verses in milliseconds. Experience the entire Bible at your fingertips.
          </p>
        </motion.div>
        
        {!bibleData ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-white/5 backdrop-blur-2xl rounded-[2rem] p-12 text-center border border-white/10 shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6]"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/10 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <Database className="w-10 h-10 text-[#8b5cf6]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Neural Database Required</h2>
            <p className="text-[#94a3b8] mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              To perform instantaneous, offline full-text queries, you need to download the encrypted offline database.
            </p>
            <Link 
              href="/settings"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              <Database className="w-5 h-5" /> Download Database Now
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <motion.div 
              className="relative z-30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative bg-[#0f172a]/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 p-3 md:p-4 flex flex-col md:flex-row gap-3 transition-all hover:border-white/20 focus-within:border-[#8b5cf6]/50 focus-within:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                
                <div className="relative flex-grow flex items-center group">
                  <SearchIcon className="absolute left-6 w-6 h-6 text-[#64748b] group-focus-within:text-[#8b5cf6] transition-colors" />
                  <input 
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for faith, love, Jerusalem..."
                    className="w-full bg-transparent pl-16 pr-6 py-4 md:py-5 text-xl md:text-2xl font-medium text-white placeholder:text-[#475569] focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {isSearching && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute right-6"
                      >
                        <div className="w-6 h-6 border-3 border-[#1e293b] border-t-[#8b5cf6] rounded-full animate-spin" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px w-full md:w-px md:h-16 bg-white/10 my-2 md:my-0 self-center hidden md:block"></div>

                <div className="flex flex-col sm:flex-row gap-3 md:w-auto shrink-0 px-2 md:px-0">
                  <div className="relative group/select">
                    <select
                      value={testament}
                      onChange={(e) => setTestament(e.target.value as any)}
                      className="w-full h-full min-h-[56px] pl-5 pr-12 bg-[#1e293b]/50 hover:bg-[#1e293b] transition-colors border border-transparent hover:border-white/10 focus:border-[#8b5cf6]/50 focus:ring-0 rounded-2xl appearance-none text-[#cbd5e1] font-medium cursor-pointer"
                    >
                      <option value="all">All Bible</option>
                      <option value="ot">Old Testament</option>
                      <option value="nt">New Testament</option>
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                  </div>
                  
                  <div className="relative group/select">
                    <select
                      value={bookFilter}
                      onChange={(e) => setBookFilter(e.target.value)}
                      className="w-full h-full min-h-[56px] pl-5 pr-12 bg-[#1e293b]/50 hover:bg-[#1e293b] transition-colors border border-transparent hover:border-white/10 focus:border-[#8b5cf6]/50 focus:ring-0 rounded-2xl appearance-none text-[#cbd5e1] font-medium cursor-pointer"
                    >
                      <option value="all">Any Book</option>
                      {BOOK_NAMES.map(book => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                    </select>
                    <Book className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
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
                    className="flex items-center justify-center gap-3 py-16 text-[#64748b] bg-white/5 rounded-3xl border border-white/5"
                  >
                    <AlertCircle className="w-5 h-5 text-[#f59e0b]" /> 
                    <span className="text-lg">Keep typing... at least 3 characters.</span>
                  </motion.div>
                ) : results.length === 0 && query.trim().length >= 3 && !isSearching ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-24 text-center bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm"
                  >
                    <div className="w-20 h-20 bg-[#1e293b]/50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#475569] shadow-inner">
                      <SearchIcon className="w-10 h-10 opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Zero Matches Found</h3>
                    <p className="text-[#94a3b8] text-lg">Try adjusting your spelling or widening your filters.</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between mb-8 px-4 font-medium"
                >
                  <span className="text-[#cbd5e1] text-lg">
                    <span className="text-white font-bold">{results.length}{results.length === 100 ? '+' : ''}</span> matches found
                  </span>
                  <span className="flex items-center gap-1.5 text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full text-sm font-bold border border-[#8b5cf6]/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                    <Zap className="w-4 h-4" /> {searchTime.toFixed(0)}ms
                  </span>
                </motion.div>
              )}

              <div className="grid gap-5 relative z-20">
                <AnimatePresence>
                  {results.map((res, i) => (
                    <motion.div
                      key={`${res.book}-${res.chapter}-${res.verse}-${i}`}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.5, type: "spring", stiffness: 100 }}
                    >
                      <Link 
                        href={`/read/${res.book.toLowerCase().replace(/ /g, '-')}/${res.chapter}#v${res.verse}`}
                        className="group block bg-[#1e293b]/40 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-lg border border-white/10 hover:border-[#8b5cf6]/50 hover:bg-[#1e293b]/60 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/0 via-[#8b5cf6]/0 to-[#8b5cf6]/0 group-hover:from-[#8b5cf6]/5 group-hover:to-[#3b82f6]/5 transition-all duration-500"></div>
                        <div className="relative z-10 flex items-center justify-between mb-4">
                          <span className="font-bold tracking-wide text-white bg-[#0f172a] px-4 py-2 rounded-xl text-sm border border-white/5 shadow-sm group-hover:border-[#8b5cf6]/30 transition-colors">
                            {res.book} <span className="text-[#8b5cf6]">{res.chapter}:{res.verse}</span>
                          </span>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#8b5cf6] group-hover:scale-110 transition-all duration-300">
                            <ArrowRight className="w-5 h-5 text-[#94a3b8] group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <p className="relative z-10 text-[#e2e8f0] text-xl md:text-2xl leading-relaxed font-serif tracking-wide group-hover:text-white transition-colors">
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
    </div>
  );
}
