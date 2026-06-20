import { NextResponse } from 'next/server';
// @ts-expect-error: No types available for this package
import * as crossref from '@texttree/bible-crossref';

export async function POST(request: Request) {
  try {
    const { book, chapter, verse } = await request.json();
    
    if (!book || !chapter || !verse) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Convert book name to abbreviation
    const bookMapping: Record<string, string> = {
      'genesis': 'gen', 'exodus': 'exo', 'leviticus': 'lev', 'numbers': 'num', 'deuteronomy': 'deu',
      'joshua': 'jos', 'judges': 'jdg', 'ruth': 'rut', '1 samuel': '1sa', '2 samuel': '2sa',
      '1 kings': '1ki', '2 kings': '2ki', '1 chronicles': '1ch', '2 chronicles': '2ch', 'ezra': 'ezr',
      'nehemiah': 'neh', 'esther': 'est', 'job': 'job', 'psalms': 'psa', 'proverbs': 'pro',
      'ecclesiastes': 'ecc', 'song of solomon': 'sng', 'isaiah': 'isa', 'jeremiah': 'jer', 'lamentations': 'lam',
      'ezekiel': 'ezk', 'daniel': 'dan', 'hosea': 'hos', 'joel': 'jol', 'amos': 'amo',
      'obadiah': 'oba', 'jonah': 'jon', 'micah': 'mic', 'nahum': 'nam', 'habakkuk': 'hab',
      'zephaniah': 'zep', 'haggai': 'hag', 'zechariah': 'zec', 'malachi': 'mal', 'matthew': 'mat',
      'mark': 'mrk', 'luke': 'luk', 'john': 'jhn', 'acts': 'act', 'romans': 'rom',
      '1 corinthians': '1co', '2 corinthians': '2co', 'galatians': 'gal', 'ephesians': 'eph', 'philippians': 'php',
      'colossians': 'col', '1 thessalonians': '1th', '2 thessalonians': '2th', '1 timothy': '1ti', '2 timothy': '2ti',
      'titus': 'tit', 'philemon': 'phm', 'hebrews': 'heb', 'james': 'jas', '1 peter': '1pe',
      '2 peter': '2pe', '1 john': '1jn', '2 john': '2jn', '3 john': '3jn', 'jude': 'jud',
      'revelation': 'rev'
    };

    const bookAbbr = bookMapping[book.toLowerCase()];
    if (!bookAbbr) {
       return NextResponse.json({ crossrefs: [] });
    }

    // `getByBC` returns an array where index 0 is chapter array, index 1 is verse 1, etc.
    const chapterData = crossref.getByBC(bookAbbr, chapter);
    if (!chapterData || !chapterData[verse]) {
       return NextResponse.json({ crossrefs: [] });
    }

    // Extract the array of cross references for this specific verse
    let refs = chapterData[verse];
    if (!Array.isArray(refs)) {
       refs = [];
    }
    
    // Some verses might have dozens of references. We'll pick the first 3 for UI purposes.
    const topRefs = refs.slice(0, 3);

    return NextResponse.json({ crossrefs: topRefs });
    
  } catch (error) {
    console.error("Crossref API Error:", error);
    return NextResponse.json({ error: "Failed to load cross references" }, { status: 500 });
  }
}
