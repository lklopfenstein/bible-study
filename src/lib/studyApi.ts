export interface StrongsDefinition {
  word: string;
  strongsNumber: string;
  originalLanguage: string;
  transliteration: string;
  definition: string;
}

export interface Commentary {
  source: string;
  text: string;
}

export interface CrossReference {
  reference: string;
  textSnippet: string;
}

/**
 * Fetches Strong's dictionary data.
 * In a production setting with API keys, this would hit Bible SuperSearch or Faithlife.
 * We use robust mock data here to guarantee the UI demonstrations work flawlessly without CORS issues.
 */
export async function getStrongsData(book: string, chapter: number, verse: number): Promise<StrongsDefinition[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // If New Testament (Matthew onwards), it's Greek. Otherwise Hebrew.
  const isNT = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'].includes(book);

  if (isNT && book === 'John' && chapter === 3 && verse === 16) {
    return [
      { word: 'loved', strongsNumber: 'G25', originalLanguage: 'ἀγαπάω', transliteration: 'agapaō', definition: 'To love (in a social or moral sense); to welcome, to entertain, to be fond of, to love dearly.' },
      { word: 'world', strongsNumber: 'G2889', originalLanguage: 'κόσμος', transliteration: 'kosmos', definition: 'An apt and harmonious arrangement or constitution, order, government. The inhabitants of the earth.' },
      { word: 'believes', strongsNumber: 'G4100', originalLanguage: 'πιστεύω', transliteration: 'pisteuō', definition: 'To think to be true, to be persuaded of, to credit, place confidence in.' }
    ];
  }

  return [
    { 
      word: 'Example Word', 
      strongsNumber: isNT ? 'G1234' : 'H1234', 
      originalLanguage: isNT ? 'παράδειγμα' : 'דּוּגמָה', 
      transliteration: isNT ? 'paradeigma' : 'dugmah', 
      definition: 'This is a demonstrative definition representing the original intent and translation of the text.' 
    }
  ];
}

/**
 * Fetches Commentary data.
 */
export async function getCommentary(book: string, chapter: number, verse: number): Promise<Commentary[]> {
  await new Promise(resolve => setTimeout(resolve, 600));

  return [
    {
      source: 'Matthew Henry\'s Concise Commentary',
      text: `Here is the great gospel duty, to believe in Jesus Christ. It is not merely to assent to the truth of the record, but to rest upon him, and rely upon him, and apply to ourselves what is said of him. It is to receive him as our Prophet, Priest, and King. The great gospel benefit is, that we shall not perish, but have everlasting life.`
    },
    {
      source: 'John Gill\'s Exposition',
      text: `This shows the original of salvation, and the cause of it, which is the love of God; and the nature of this love, that it is a love of pity and compassion, of complacency and delight, and of good will.`
    }
  ];
}

/**
 * Fetches Cross References.
 */
export async function getCrossReferences(book: string, chapter: number, verse: number): Promise<CrossReference[]> {
  await new Promise(resolve => setTimeout(resolve, 700));

  if (book === 'John' && chapter === 3 && verse === 16) {
    return [
      { reference: 'Romans 5:8', textSnippet: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.' },
      { reference: '1 John 4:9', textSnippet: 'This is how God showed his love among us: He sent his one and only Son into the world that we might live through him.' },
      { reference: 'Ephesians 2:4-5', textSnippet: 'But because of his great love for us, God, who is rich in mercy, made us alive with Christ...' }
    ];
  }

  return [
    { reference: 'Psalms 119:105', textSnippet: 'Your word is a lamp for my feet, a light on my path.' },
    { reference: '2 Timothy 3:16', textSnippet: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.' }
  ];
}
