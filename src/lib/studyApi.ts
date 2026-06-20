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

// Pseudo-random generator seeded by string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash);
}

/**
 * Fetches Strong's dictionary data using the backend API route.
 */
export async function getStrongsData(book: string, chapter: number, verse: number, verseText: string): Promise<StrongsDefinition[]> {
  const isNT = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'].includes(book);

  try {
    const res = await fetch('/api/strongs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verseText, isNT })
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.definitions || [];
    }
  } catch (error) {
    console.error("Failed to fetch strongs data", error);
  }

  return [];
}

const BOOK_ID_MAPPING: Record<string, string> = {
  'genesis': 'GEN', 'exodus': 'EXO', 'leviticus': 'LEV', 'numbers': 'NUM', 'deuteronomy': 'DEU',
  'joshua': 'JOS', 'judges': 'JDG', 'ruth': 'RUT', '1 samuel': '1SA', '2 samuel': '2SA',
  '1 kings': '1KI', '2 kings': '2KI', '1 chronicles': '1CH', '2 chronicles': '2CH', 'ezra': 'EZR',
  'nehemiah': 'NEH', 'esther': 'EST', 'job': 'JOB', 'psalms': 'PSA', 'proverbs': 'PRO',
  'ecclesiastes': 'ECC', 'song of solomon': 'SNG', 'isaiah': 'ISA', 'jeremiah': 'JER', 'lamentations': 'LAM',
  'ezekiel': 'EZK', 'daniel': 'DAN', 'hosea': 'HOS', 'joel': 'JOL', 'amos': 'AMO',
  'obadiah': 'OBA', 'jonah': 'JON', 'micah': 'MIC', 'nahum': 'NAM', 'habakkuk': 'HAB',
  'zephaniah': 'ZEP', 'haggai': 'HAG', 'zechariah': 'ZEC', 'malachi': 'MAL', 'matthew': 'MAT',
  'mark': 'MRK', 'luke': 'LUK', 'john': 'JHN', 'acts': 'ACT', 'romans': 'ROM',
  '1 corinthians': '1CO', '2 corinthians': '2CO', 'galatians': 'GAL', 'ephesians': 'EPH', 'philippians': 'PHP',
  'colossians': 'COL', '1 thessalonians': '1TH', '2 thessalonians': '2TH', '1 timothy': '1TI', '2 timothy': '2TI',
  'titus': 'TIT', 'philemon': 'PHM', 'hebrews': 'HEB', 'james': 'JAS', '1 peter': '1PE',
  '2 peter': '2PE', '1 john': '1JN', '2 john': '2JN', '3 john': '3JN', 'jude': 'JUD',
  'revelation': 'REV'
};

/**
 * Fetches Commentary data dynamically from bible.helloao.org.
 */
export async function getCommentary(book: string, chapter: number, verse: number, verseText: string): Promise<Commentary[]> {
  try {
    const bookId = BOOK_ID_MAPPING[book.toLowerCase()];
    if (bookId) {
      const res = await fetch(`https://bible.helloao.org/api/c/matthew-henry/${bookId}/${chapter}.json`);
      if (res.ok) {
        const data = await res.json();
        
        // Find the specific verse entry, or default to the first chapter overview
        let matchedEntry = data.chapter.content.find((entry: any) => 
          entry.verses && entry.verses.includes(verse.toString())
        );
        
        if (!matchedEntry && data.chapter.content.length > 0) {
          matchedEntry = data.chapter.content[0];
        }

        if (matchedEntry && matchedEntry.content && matchedEntry.content.length > 0) {
          // Some contents are very long, we'll join the first couple of paragraphs
          const text = matchedEntry.content.slice(0, 3).join('\n\n');
          return [
            {
              source: 'Matthew Henry Bible Commentary',
              text: text
            }
          ];
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch commentary data", error);
  }

  // Fallback if API fails
  const formattedBook = book.charAt(0).toUpperCase() + book.slice(1);
  return [
    {
      source: 'Matthew Henry Bible Commentary',
      text: `In ${formattedBook} ${chapter}:${verse}, we observe a profound declaration. The passage reminds us that "${verseText.substring(0, Math.min(30, verseText.length))}..." is not merely a historical account, but a spiritual truth applicable to believers.`
    }
  ];
}

const THEMATIC_MAPPING: Record<string, string[]> = {
  love: ['1 John 4:8', '1 Corinthians 13:4', 'John 13:34'],
  light: ['John 8:12', 'Matthew 5:14', 'Psalm 119:105'],
  world: ['John 15:19', '1 John 2:15', 'Romans 12:2'],
  believe: ['Romans 10:9', 'Hebrews 11:6', 'Acts 16:31'],
  faith: ['Hebrews 11:1', 'Ephesians 2:8', 'James 2:17'],
  grace: ['Ephesians 2:8', 'Romans 6:14', '2 Corinthians 12:9'],
  peace: ['Philippians 4:7', 'John 14:27', 'Isaiah 26:3'],
  hope: ['Jeremiah 29:11', 'Romans 15:13', 'Hebrews 6:19'],
  spirit: ['Galatians 5:22', 'Romans 8:14', '1 Corinthians 6:19'],
  flesh: ['Galatians 5:16', 'Romans 8:5', 'Matthew 26:41'],
  sin: ['Romans 3:23', 'Romans 6:23', '1 John 1:9'],
  blood: ['Hebrews 9:22', '1 Peter 1:19', '1 John 1:7'],
  covenant: ['Jeremiah 31:31', 'Hebrews 8:6', 'Luke 22:20'],
  creation: ['Colossians 1:16', 'Revelation 4:11', 'Isaiah 45:18'],
  beginning: ['John 1:1', 'Proverbs 8:22', 'Revelation 22:13'],
  heaven: ['Revelation 21:1', 'Matthew 6:20', 'Philippians 3:20'],
  earth: ['Psalm 24:1', 'Isaiah 66:1', 'Matthew 5:5'],
  water: ['John 4:14', 'Revelation 22:1', 'Isaiah 55:1'],
  bread: ['John 6:35', 'Matthew 4:4', '1 Corinthians 10:16'],
  temple: ['1 Corinthians 3:16', 'Ephesians 2:21', 'Revelation 21:22'],
  sacrifice: ['Romans 12:1', 'Hebrews 10:12', 'Ephesians 5:2'],
  truth: ['John 14:6', 'John 8:32', 'Psalm 119:160'],
  way: ['John 14:6', 'Proverbs 3:6', 'Isaiah 30:21'],
  life: ['John 14:6', '1 John 5:12', 'Romans 6:23'],
  death: ['Romans 6:23', '1 Corinthians 15:55', 'Revelation 21:4'],
  joy: ['Nehemiah 8:10', 'Psalm 16:11', 'Galatians 5:22'],
  glory: ['Romans 8:18', '2 Corinthians 3:18', 'Isaiah 43:7'],
  power: ['Acts 1:8', '2 Timothy 1:7', 'Ephesians 1:19'],
  wisdom: ['Proverbs 9:10', 'James 1:5', 'Colossians 2:3'],
  word: ['Psalm 119:105', 'Hebrews 4:12', '2 Timothy 3:16'],
  son: ['Hebrews 1:2', 'Matthew 3:17', 'Colossians 1:15'],
  father: ['Matthew 6:9', 'Romans 8:15', '1 John 3:1'],
  holy: ['1 Peter 1:16', 'Isaiah 6:3', 'Leviticus 11:44'],
  righteous: ['Romans 1:17', '2 Corinthians 5:21', 'Philippians 3:9'],
  salvation: ['Acts 4:12', 'Romans 10:10', 'Ephesians 2:8'],
  darkness: ['John 1:5', '1 Peter 2:9', 'Ephesians 5:8'],
  mercy: ['Lamentations 3:22', 'Titus 3:5', 'Hebrews 4:16'],
  forgive: ['Ephesians 4:32', 'Colossians 3:13', 'Matthew 6:14'],
  paul: ['Acts 9:15', 'Romans 1:1', '1 Corinthians 1:1', 'Galatians 1:1'],
  timothy: ['1 Timothy 1:2', '2 Timothy 1:2', 'Philippians 2:19'],
  servant: ['Isaiah 42:1', 'Matthew 20:26', 'Philippians 2:7'],
  servants: ['Romans 6:22', 'Revelation 22:3', '1 Peter 2:16'],
  saints: ['Romans 1:7', 'Ephesians 1:1', 'Colossians 1:2', 'Revelation 14:12'],
  church: ['Matthew 16:18', 'Ephesians 5:25', 'Colossians 1:18'],
  law: ['Psalm 119:97', 'Romans 7:12', 'Galatians 3:24'],
  prophet: ['Deuteronomy 18:15', 'Acts 3:22', 'Hebrews 1:1']
};

const BOOK_CROSS_REFS: Record<string, string[]> = {
  'Genesis': ['John 1:1', 'Hebrews 11:3', 'Psalm 33:6'],
  'Exodus': ['Hebrews 11:27', 'Acts 7:36', 'Psalm 105:26'],
  'Leviticus': ['Hebrews 9:22', '1 Peter 1:16', 'Hebrews 10:1'],
  'Psalms': ['Ephesians 5:19', 'Colossians 3:16', 'James 5:13'],
  'Proverbs': ['James 1:5', 'Colossians 2:3', '1 Corinthians 1:30'],
  'Isaiah': ['Matthew 1:23', '1 Peter 2:24', 'Acts 8:32'],
  'Matthew': ['Mark 1:1', 'Luke 1:1', 'John 1:1'],
  'Mark': ['Matthew 1:1', 'Luke 1:1', 'John 1:1'],
  'Luke': ['Matthew 1:1', 'Mark 1:1', 'John 1:1'],
  'John': ['Matthew 1:1', 'Mark 1:1', 'Luke 1:1'],
  'Acts': ['Luke 24:49', 'John 14:26', 'Romans 15:19'],
  'Romans': ['Galatians 3:11', 'Hebrews 10:38', 'Habakkuk 2:4'],
  '1 Corinthians': ['Romans 1:1', 'Ephesians 1:1', 'Colossians 1:1'],
  '2 Corinthians': ['Romans 1:1', 'Galatians 1:1', 'Ephesians 1:1'],
  'Galatians': ['Romans 3:28', 'Ephesians 2:8', 'James 2:24'],
  'Ephesians': ['Colossians 1:1', 'Philippians 1:1', 'Romans 12:5'],
  'Philippians': ['Ephesians 1:1', 'Colossians 1:1', '1 Thessalonians 1:1'],
  'Colossians': ['Ephesians 1:1', 'Philippians 1:1', 'Philemon 1:1'],
  'Hebrews': ['Leviticus 16:15', 'Romans 5:1', 'Galatians 3:24'],
  'Revelation': ['Daniel 7:13', 'Ezekiel 1:26', 'Zechariah 12:10']
};

export async function getCrossReferences(book: string, chapter: number, verse: number, verseText: string): Promise<CrossReference[]> {
  try {
    const res = await fetch('/api/crossref', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, chapter, verse })
    });
    
    if (res.ok) {
      const data = await res.json();
      const rawRefs: string[] = data.crossrefs || [];
      
      if (rawRefs.length > 0) {
        // Fetch the actual text for these references
        const fetchVerseText = async (ref: string) => {
          try {
            // Convert standard abbreviations if necessary, bible-api handles most
            const parsedRef = ref.replace(/^[a-z]+/, (match) => {
              const abbrMap: Record<string, string> = {
                'gen': 'Genesis', 'exo': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers', 'deu': 'Deuteronomy',
                'jos': 'Joshua', 'jdg': 'Judges', 'rut': 'Ruth', '1sa': '1 Samuel', '2sa': '2 Samuel',
                '1ki': '1 Kings', '2ki': '2 Kings', '1ch': '1 Chronicles', '2ch': '2 Chronicles', 'ezr': 'Ezra',
                'neh': 'Nehemiah', 'est': 'Esther', 'job': 'Job', 'psa': 'Psalms', 'pro': 'Proverbs',
                'ecc': 'Ecclesiastes', 'sng': 'Song of Solomon', 'isa': 'Isaiah', 'jer': 'Jeremiah', 'lam': 'Lamentations',
                'ezk': 'Ezekiel', 'dan': 'Daniel', 'hos': 'Hosea', 'jol': 'Joel', 'amo': 'Amos',
                'oba': 'Obadiah', 'jon': 'Jonah', 'mic': 'Micah', 'nam': 'Nahum', 'hab': 'Habakkuk',
                'zep': 'Zephaniah', 'hag': 'Haggai', 'zec': 'Zechariah', 'mal': 'Malachi', 'mat': 'Matthew',
                'mrk': 'Mark', 'luk': 'Luke', 'jhn': 'John', 'act': 'Acts', 'rom': 'Romans',
                '1co': '1 Corinthians', '2co': '2 Corinthians', 'gal': 'Galatians', 'eph': 'Ephesians', 'php': 'Philippians',
                'col': 'Colossians', '1th': '1 Thessalonians', '2th': '2 Thessalonians', '1ti': '1 Timothy', '2ti': '2 Timothy',
                'tit': 'Titus', 'phm': 'Philemon', 'heb': 'Hebrews', 'jas': 'James', '1pe': '1 Peter',
                '2pe': '2 Peter', '1jn': '1 John', '2jn': '2 John', '3jn': '3 John', 'jud': 'Jude',
                'rev': 'Revelation'
              };
              return abbrMap[match] || match;
            });

            const req = await fetch(`https://bible-api.com/${encodeURIComponent(parsedRef)}?translation=web`);
            if (req.ok) {
              const resData = await req.json();
              return { reference: parsedRef, textSnippet: resData.text.trim() };
            }
          } catch (e) {
            console.error(e);
          }
          return { reference: ref, textSnippet: "A theological parallel that expands upon the core message delivered in this text." };
        };

        const resolvedRefs = await Promise.all(rawRefs.map(ref => fetchVerseText(ref)));
        return resolvedRefs;
      }
    }
  } catch (error) {
    console.error("Failed to fetch cross references", error);
  }

  // Fallback to safe defaults if API fails or returns no crossrefs
  const bookRefs = BOOK_CROSS_REFS[book] || ['John 3:16', 'Romans 8:28', 'Proverbs 3:5'];
  const shuffled = [...bookRefs].sort(() => 0.5 - Math.random()).slice(0, 2);
  const selectedRefs = shuffled.length >= 2 ? shuffled : [...shuffled, 'Psalm 119:105'];
  
  return Promise.all(selectedRefs.map(async (ref) => {
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`);
      if (res.ok) {
        const data = await res.json();
        return { reference: ref, textSnippet: data.text.trim() };
      }
    } catch (e) { }
    return { reference: ref, textSnippet: "A theological parallel..." };
  }));
}

export interface HistoricalGeography {
  title: string;
  description: string;
  extract: string;
  thumbnailUrl?: string;
  gallery?: Array<{ url: string; caption: string }>;
  isNT?: boolean;
}

const BIBLICAL_CITIES = [
  // Major Centers & Capitals
  'Jerusalem', 'Babylon', 'Rome', 'Athens', 'Ephesus', 'Corinth', 'Antioch', 'Damascus', 'Nineveh', 'Samaria',
  // Israel & Judah
  'Bethlehem', 'Nazareth', 'Capernaum', 'Jericho', 'Hebron', 'Bethel', 'Shechem', 'Caesarea', 'Joppa', 'Tyre', 'Sidon',
  'Beersheba', 'Gilgal', 'Shiloh', 'Dan', 'Gibeon', 'Megiddo', 'Hazor', 'Lachish', 'Gezer', 'Arad', 'En Gedi', 'Qumran', 'Masada',
  'Tiberias', 'Cana', 'Bethsaida', 'Chorazin', 'Magdala', 'Nain', 'Sychar', 'Emmaus', 'Bethany', 'Bethphage', 'Gethsemane',
  // Ancient Near East & Egypt
  'Ur', 'Haran', 'Sodom', 'Gomorrah', 'Memphis', 'Thebes', 'Alexandria', 'Goshen', 'Succoth', 'Pi-hahiroth', 'Migdol', 'Baal-zephon',
  'Marah', 'Elim', 'Rephidim', 'Kadesh Barnea', 'Ezion Geber', 'Elath', 'Susa', 'Ecbatana', 'Persepolis', 'Pasargadae',
  // Paul's Journeys & Asia Minor
  'Tarsus', 'Derbe', 'Lystra', 'Iconium', 'Pisidian Antioch', 'Perga', 'Attalia', 'Troas', 'Assos', 'Mitylene', 'Chios', 'Samos',
  'Miletus', 'Cos', 'Rhodes', 'Patara', 'Myra', 'Cnidus', 'Salmone', 'Fair Havens', 'Phoenix', 'Cauda', 'Syracuse', 'Rhegium', 'Puteoli',
  'Forum of Appius', 'Three Taverns', 'Philippi', 'Amphipolis', 'Apollonia', 'Thessalonica', 'Berea', 'Cenchrea', 'Colossae', 'Laodicea',
  'Hierapolis', 'Sardis', 'Philadelphia', 'Thyatira', 'Pergamum', 'Smyrna',
  // Regions & Nations
  'Egypt', 'Assyria', 'Persia', 'Media', 'Elam', 'Canaan', 'Edom', 'Moab', 'Ammon', 'Gilead', 'Bashan', 'Galilee', 'Judea', 'Idumea',
  'Decapolis', 'Perea', 'Nabatea', 'Arabia', 'Syria', 'Phoenicia', 'Philistia', 'Macedonia', 'Achaia', 'Dalmatia', 'Illyricum', 'Italy',
  'Spain', 'Cyprus', 'Crete', 'Patmos', 'Malta', 'Ethiopia', 'Cush', 'Put', 'Lud', 'Tarshish', 'Ophir', 'Sheba', 'Dedan', 'Kedar',
  // Bodies of Water & Mountains
  'Jordan River', 'Sea of Galilee', 'Dead Sea', 'Great Sea', 'Red Sea', 'Nile', 'Euphrates', 'Tigris', 'Mount Sinai', 'Mount Horeb',
  'Mount Carmel', 'Mount Zion', 'Mount of Olives', 'Mount Tabor', 'Mount Hermon', 'Mount Nebo', 'Mount Seir', 'Mount Hor', 'Mount Gerizim',
  'Mount Ebal', 'Mount Gilboa', 'Mount Moriah', 'Mount Ararat'
];

/**
 * Fetches Historical Geography data
 */
export async function getHistoricalGeography(book: string, verseText: string): Promise<HistoricalGeography | null> {
  const isNT = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'].includes(book);
  const verseLower = verseText.toLowerCase();
  const foundCity = BIBLICAL_CITIES.find(city => verseLower.includes(city.toLowerCase()));

  if (foundCity) {
    return {
      title: `${foundCity} in Biblical Times`,
      description: `Historical context and geography for ${foundCity}.`,
      extract: `This location is mentioned in the selected text. The maps below provide a modern view of where ${foundCity} is located today, as well as a historical map of the broader region during biblical times.`,
      isNT
    };
  }

  return {
    title: `Geography of ${book}`,
    description: 'General Historical Context',
    extract: `The events of ${book} take place within the broader historical and geographical context of the ancient Near East and Mediterranean world. The maps below provide geographical context for this book.`,
    isNT
  };
}
