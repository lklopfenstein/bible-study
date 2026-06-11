import { NextResponse } from 'next/server';
// @ts-ignore
import strongs from 'strongs';

// Initialize a reverse index
let isIndexed = false;
const wordIndex: Record<string, string[]> = {};

function buildReverseIndex() {
  if (isIndexed) return;
  
  for (const key of Object.keys(strongs)) {
    const entry = (strongs as any)[key];
    const defs = (entry.kjv_def || '') + ' ' + (entry.strongs_def || '');
    
    // Extract pure words
    const words = defs.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
    
    for (const w of words) {
      if (w.length > 3) {
        if (!wordIndex[w]) wordIndex[w] = [];
        // Cap index at 5 matches per word to prevent massive payloads for common words like "that"
        if (!wordIndex[w].includes(key) && wordIndex[w].length < 5) {
          wordIndex[w].push(key);
        }
      }
    }
  }
  isIndexed = true;
}

export async function POST(request: Request) {
  try {
    buildReverseIndex();
    
    const { verseText, isNT } = await request.json();
    
    if (!verseText || typeof verseText !== 'string') {
      return NextResponse.json({ definitions: [] });
    }
    
    const words = verseText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
    const results: any[] = [];
    const addedKeys = new Set<string>();

    for (const word of words) {
      const matches = wordIndex[word] || [];
      for (const key of matches) {
        // Ensure we match NT words to NT verses, OT words to OT verses
        const isWordNT = key.startsWith('G');
        if (isNT === isWordNT && !addedKeys.has(key)) {
          const entry = (strongs as any)[key];
          results.push({
            word: word,
            strongsNumber: key,
            originalLanguage: entry.lemma || '',
            transliteration: entry.xlit || '',
            definition: entry.strongs_def || entry.kjv_def || 'No definition available.'
          });
          addedKeys.add(key);
        }
      }
      
      // Stop after 5 total definitions to avoid overwhelming the UI
      if (results.length >= 5) break;
    }

    return NextResponse.json({ definitions: results });
    
  } catch (error) {
    console.error("Strongs API Error:", error);
    return NextResponse.json({ error: "Failed to load Strongs data" }, { status: 500 });
  }
}
