'use client';

import { useState, useEffect, useMemo } from 'react';
import localforage from 'localforage';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Database } from 'lucide-react';
import SearchFilters, { BOOK_NAMES } from '@/components/ui/SearchFilters';

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

  useEffect(() => {
    // Load database from IndexedDB
    localforage.getItem('bible_data_web').then((data: any) => {
      if (data && Array.isArray(data)) {
        setBibleData(data);
      }
      setIsLoaded(true);
    });
  }, []);

  // Use debounce for search query
  useEffect(() => {
    if (!bibleData || query.trim().length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    const delayDebounceFn = setTimeout(() => {
      const searchTerms = query.toLowerCase().split(' ').filter(t => t.trim() !== '');
      const matched: SearchResult[] = [];
      
      // Simple loop over the 3D array: Book > Chapter > Verse
      for (let bIndex = 0; bIndex < bibleData.length; bIndex++) {
        const bookName = BOOK_NAMES[bIndex];
        
        // Apply book filter
        if (bookFilter !== 'all' && bookName !== bookFilter) continue;
        
        // Apply testament filter (0-38 is OT, 39-65 is NT)
        if (testament === 'ot' && bIndex > 38) continue;
        if (testament === 'nt' && bIndex <= 38) continue;

        const bookData = bibleData[bIndex];
        for (let cIndex = 0; cIndex < bookData.length; cIndex++) {
          const chapterData = bookData[cIndex];
          for (let vIndex = 0; vIndex < chapterData.length; vIndex++) {
            const verseText = chapterData[vIndex];
            const lowerVerseText = verseText.toLowerCase();
            
            // Check if all search terms are in the verse
            const isMatch = searchTerms.every(term => lowerVerseText.includes(term));
            
            if (isMatch) {
              matched.push({
                book: bookName,
                chapter: cIndex + 1,
                verse: vIndex + 1,
                text: verseText
              });
              
              // Cap at 100 results for performance
              if (matched.length >= 100) {
                setResults(matched);
                setIsSearching(false);
                return;
              }
            }
          }
        }
      }
      
      setResults(matched);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, testament, bookFilter, bibleData]);

  // Handle URL query parameters if a user clicked "Search" from deep study
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      // Strip query string so it doesn't stay in URL forever
      window.history.replaceState({}, '', '/search');
    }
  }, []);

  // Highlight search terms in the text
  const highlightText = (text: string) => {
    if (!query.trim()) return text;
    const terms = query.toLowerCase().split(' ').filter(t => t.trim() !== '');
    if (terms.length === 0) return text;
    
    // Create a regex to match any of the terms
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (terms.includes(part.toLowerCase())) {
        return <mark key={i} className="bg-yellow-200 text-stone-900 rounded-sm px-0.5">{part}</mark>;
      }
      return part;
    });
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-12 flex justify-center items-center h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-serif font-semibold text-stone-800 mb-6">Search Scripture</h1>
      
      {!bibleData ? (
        <div className="bg-stone-100 rounded-2xl p-8 text-center border border-stone-200">
          <Database className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-stone-800 mb-2">Offline Database Required</h2>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">
            To perform lightning-fast, full-text searches across the entire Bible, please download the offline database.
          </p>
          <Link 
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white font-medium rounded-xl hover:bg-stone-700 transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      ) : (
        <>
          <SearchFilters 
            query={query} 
            setQuery={setQuery} 
            testament={testament} 
            setTestament={setTestament} 
            bookFilter={bookFilter} 
            setBookFilter={setBookFilter} 
            isSearching={isSearching}
          />

          <div className="space-y-4">
            {query.trim().length > 0 && query.trim().length < 3 && (
              <p className="text-stone-500 text-sm flex items-center gap-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <AlertCircle className="w-4 h-4" /> Please enter at least 3 characters to search.
              </p>
            )}

            {results.length > 0 && (
              <p className="text-sm font-medium text-stone-500 mb-4 px-2">
                Found {results.length}{results.length === 100 ? '+' : ''} matches
              </p>
            )}

            {results.length === 0 && query.trim().length >= 3 && !isSearching && (
              <div className="text-center py-12 text-stone-500">
                <p>No verses found matching "{query}"</p>
              </div>
            )}

            {results.map((res, i) => (
              <Link 
                key={`${res.book}-${res.chapter}-${res.verse}-${i}`}
                href={`/read/${res.book.toLowerCase().replace(/ /g, '-')}/${res.chapter}`}
                className="block bg-white p-5 rounded-2xl shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-stone-800 group-hover:text-stone-900">
                    {res.book} {res.chapter}:{res.verse}
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
                </div>
                <p className="text-stone-600 font-serif leading-relaxed">
                  {highlightText(res.text)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
