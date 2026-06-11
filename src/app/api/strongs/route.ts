import { NextResponse } from 'next/server';
// @ts-ignore
import strongs from 'strongs';

// Initialize a reverse index
let isIndexed = false;
const wordIndex: Record<string, string[]> = {};

const STOP_WORDS = new Set(['the','and','that','this','for','with','unto','upon','which','their','from','they','have','been','shall','will','were','what','when','where','who','whom','whose','there','here','then','than','also','into','about','above','after','again','against','all','any','because','before','could','should','would','down','even','every','good','great','like','many','more','most','much','must','never','only','other','our','out','over','same','some','such','through','under','very','well','your','his','him','her','she','them','these','those']);

function buildReverseIndex() {
  if (isIndexed) return;
  
  for (const key of Object.keys(strongs)) {
    const entry = (strongs as any)[key];
    // ONLY index kjv_def so we don't accidentally map words to the long descriptive paragraphs
    const defs = entry.kjv_def || '';
    
    // Extract pure words
    const words = defs.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
    
    for (const w of words) {
      if (w.length > 3 && !STOP_WORDS.has(w)) {
        if (!wordIndex[w]) wordIndex[w] = [];
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
    
    // Extract significant words from verse text, avoiding stop words
    const words = verseText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
    const results: any[] = [];
    const addedKeys = new Set<string>();

    for (const word of words) {
      // Also try matching the base word (e.g. 'believes' -> 'believe')
      const baseWord = word.endsWith('s') ? word.slice(0, -1) : word;
      const matches = wordIndex[word] || wordIndex[baseWord] || wordIndex[word + 's'] || [];
      
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
