'use client';

import { Search, Filter, Book } from 'lucide-react';

interface SearchFiltersProps {
  query: string;
  setQuery: (q: string) => void;
  testament: 'all' | 'ot' | 'nt';
  setTestament: (t: 'all' | 'ot' | 'nt') => void;
  bookFilter: string;
  setBookFilter: (b: string) => void;
  isSearching: boolean;
}

export const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter',
  '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

export default function SearchFilters({
  query, setQuery, testament, setTestament, bookFilter, setBookFilter, isSearching
}: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 mb-6">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for words, phrases, or topics..."
          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-stone-800 placeholder-stone-400"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-stone-300 border-t-stone-800 rounded-full" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500" />
          <div className="flex bg-stone-100 p-1 rounded-lg">
            <button 
              onClick={() => setTestament('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${testament === 'all' ? 'bg-white shadow-sm text-stone-800 font-medium' : 'text-stone-500 hover:text-stone-700'}`}
            >
              All Bible
            </button>
            <button 
              onClick={() => setTestament('ot')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${testament === 'ot' ? 'bg-white shadow-sm text-stone-800 font-medium' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Old Testament
            </button>
            <button 
              onClick={() => setTestament('nt')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${testament === 'nt' ? 'bg-white shadow-sm text-stone-800 font-medium' : 'text-stone-500 hover:text-stone-700'}`}
            >
              New Testament
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 relative flex-grow md:max-w-xs">
          <Book className="absolute left-3 w-4 h-4 text-stone-400" />
          <select
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 appearance-none text-sm text-stone-700"
          >
            <option value="all">All Books</option>
            {BOOK_NAMES.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-stone-400 text-xs">▼</div>
        </div>
      </div>
    </div>
  );
}
