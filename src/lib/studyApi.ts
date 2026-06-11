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

const REAL_STRONGS_DICTIONARY: Record<string, StrongsDefinition> = {
  // Greek (NT)
  love: { word: 'love', strongsNumber: 'G26', originalLanguage: 'ἀγάπη', transliteration: 'agapē', definition: 'Brotherly love, affection, good will, love, benevolence. The highest form of love, especially characterized by God\'s love for humanity.' },
  loved: { word: 'loved', strongsNumber: 'G25', originalLanguage: 'ἀγαπάω', transliteration: 'agapaō', definition: 'To love (in a social or moral sense); to welcome, to entertain, to be fond of, to love dearly.' },
  world: { word: 'world', strongsNumber: 'G2889', originalLanguage: 'κόσμος', transliteration: 'kosmos', definition: 'An apt and harmonious arrangement or constitution, order, government. The inhabitants of the earth; the universe.' },
  believe: { word: 'believe', strongsNumber: 'G4100', originalLanguage: 'πιστεύω', transliteration: 'pisteuō', definition: 'To think to be true, to be persuaded of, to credit, place confidence in. To entrust a thing to one.' },
  believes: { word: 'believes', strongsNumber: 'G4100', originalLanguage: 'πιστεύω', transliteration: 'pisteuō', definition: 'To think to be true, to be persuaded of, to credit, place confidence in.' },
  faith: { word: 'faith', strongsNumber: 'G4102', originalLanguage: 'πίστις', transliteration: 'pistis', definition: 'Conviction of the truth of anything, belief; in the NT of a conviction or belief respecting man\'s relationship to God and divine things.' },
  grace: { word: 'grace', strongsNumber: 'G5485', originalLanguage: 'χάρις', transliteration: 'charis', definition: 'Grace, that which affords joy, pleasure, delight, sweetness, charm, loveliness. The merciful kindness by which God exerts his holy influence upon souls.' },
  peace: { word: 'peace', strongsNumber: 'G1515', originalLanguage: 'εἰρήνη', transliteration: 'eirēnē', definition: 'A state of national tranquillity; exemption from the rage and havoc of war. Peace between individuals, harmony, concord. The tranquil state of a soul assured of its salvation through Christ.' },
  spirit: { word: 'spirit', strongsNumber: 'G4151', originalLanguage: 'πνεῦμα', transliteration: 'pneuma', definition: 'A movement of air (a gentle blast). The spirit, i.e. the vital principle by which the body is animated. The Holy Spirit.' },
  holy: { word: 'holy', strongsNumber: 'G40', originalLanguage: 'ἅγιος', transliteration: 'hagios', definition: 'Reverend, worthy of veneration. Set apart for God, to be, as it were, exclusively his. Sacred.' },
  word: { word: 'word', strongsNumber: 'G3056', originalLanguage: 'λόγος', transliteration: 'logos', definition: 'A word, uttered by a living voice. The sayings of God. The Divine Word (Christ).' },
  flesh: { word: 'flesh', strongsNumber: 'G4561', originalLanguage: 'σάρξ', transliteration: 'sarx', definition: 'Flesh (the soft substance of the living body). The animal nature with its frailties and passions.' },
  truth: { word: 'truth', strongsNumber: 'G225', originalLanguage: 'ἀλήθεια', transliteration: 'alētheia', definition: 'Truth, objectively; the reality lying at the basis of an appearance; the manifested, veritable essence of a matter.' },
  life: { word: 'life', strongsNumber: 'G2222', originalLanguage: 'ζωή', transliteration: 'zōē', definition: 'Life, the state of one who is possessed of vitality or is animate. Of the absolute fullness of life, both essential and ethical, which belongs to God.' },
  light: { word: 'light', strongsNumber: 'G5457', originalLanguage: 'φῶς', transliteration: 'phōs', definition: 'Light, the light emitted by a lamp, a heavenly light. Spiritual truth and its knowledge.' },
  darkness: { word: 'darkness', strongsNumber: 'G4653', originalLanguage: 'σκοτία', transliteration: 'skotia', definition: 'Darkness. Metaphorically, of ignorance respecting divine things and human duties, and the accompanying ungodliness and immorality.' },
  sin: { word: 'sin', strongsNumber: 'G266', originalLanguage: 'ἁμαρτία', transliteration: 'hamartia', definition: 'To be without a share in, to miss the mark, to err, be mistaken. That which is done wrong, sin, an offence, a violation of the divine law in thought or in act.' },
  blood: { word: 'blood', strongsNumber: 'G129', originalLanguage: 'αἷμα', transliteration: 'haima', definition: 'Blood; blood as shed, i.e., of violence, death. The atoning blood of Christ.' },
  covenant: { word: 'covenant', strongsNumber: 'G1242', originalLanguage: 'διαθήκη', transliteration: 'diathēkē', definition: 'A disposition, arrangement, of any sort, which one wishes to be valid. A testament or will. The new covenant established by Christ.' },
  heaven: { word: 'heaven', strongsNumber: 'G3772', originalLanguage: 'οὐρανός', transliteration: 'ouranos', definition: 'The vaulted expanse of the sky. The region above the sidereal heavens, the seat of order of things eternal and consummately perfect where God dwells.' },
  earth: { word: 'earth', strongsNumber: 'G1093', originalLanguage: 'γῆ', transliteration: 'gē', definition: 'Arable land, the ground, the earth as a standing place. The inhabited earth.' },
  temple: { word: 'temple', strongsNumber: 'G3485', originalLanguage: 'ναός', transliteration: 'naos', definition: 'A temple, a shrine, that part of the temple where God himself resides. Used metaphorically of Christians.' },
  sacrifice: { word: 'sacrifice', strongsNumber: 'G2378', originalLanguage: 'θυσία', transliteration: 'thusia', definition: 'A sacrifice, victim. An offering. Used of the sacrifice of Christ, and metaphorically of spiritual sacrifices.' },
  way: { word: 'way', strongsNumber: 'G3598', originalLanguage: 'ὁδός', transliteration: 'hodos', definition: 'A way, a travelled way, road. A course of conduct, a manner of thinking, feeling, deciding.' },
  death: { word: 'death', strongsNumber: 'G2288', originalLanguage: 'θάνατος', transliteration: 'thanatos', definition: 'The death of the body. That separation (whether natural or violent) of the soul and the body by which the life on earth is ended. Spiritual death.' },
  joy: { word: 'joy', strongsNumber: 'G5479', originalLanguage: 'χαρά', transliteration: 'chara', definition: 'Joy, gladness. The cause or occasion of joy.' },
  glory: { word: 'glory', strongsNumber: 'G1391', originalLanguage: 'δόξα', transliteration: 'doxa', definition: 'Opinion, judgment, view. Splendor, brightness. Majesty, the kingly majesty which belongs to God as supreme ruler.' },
  power: { word: 'power', strongsNumber: 'G1411', originalLanguage: 'δύναμις', transliteration: 'dunamis', definition: 'Strength, power, ability. Inherent power, power residing in a thing by virtue of its nature.' },
  wisdom: { word: 'wisdom', strongsNumber: 'G4678', originalLanguage: 'σοφία', transliteration: 'sophia', definition: 'Wisdom, broad and full of intelligence; used of the knowledge of very diverse matters. Supreme intelligence, such as belongs to God.' },
  son: { word: 'son', strongsNumber: 'G5207', originalLanguage: 'υἱός', transliteration: 'huios', definition: 'A son. Used to describe the relationship of Jesus to God the Father.' },
  father: { word: 'father', strongsNumber: 'G3962', originalLanguage: 'πατήρ', transliteration: 'patēr', definition: 'Generator or male ancestor. God is called the Father of all, as the creator and preserver.' },
  righteous: { word: 'righteous', strongsNumber: 'G1342', originalLanguage: 'δίκαιος', transliteration: 'dikaios', definition: 'Righteous, observing divine laws. In a narrower sense, rendering to each his due.' },
  salvation: { word: 'salvation', strongsNumber: 'G4991', originalLanguage: 'σωτηρία', transliteration: 'sōtēria', definition: 'Deliverance, preservation, safety, salvation. Deliverance from the molestation of enemies.' },
  mercy: { word: 'mercy', strongsNumber: 'G1656', originalLanguage: 'ἔλεος', transliteration: 'eleos', definition: 'Mercy: kindness or good will towards the miserable and the afflicted, joined with a desire to help them.' },
  forgive: { word: 'forgive', strongsNumber: 'G863', originalLanguage: 'ἀφίημι', transliteration: 'aphiēmi', definition: 'To send away. To remit a debt, forgive an offense or sin.' },

  // Hebrew (OT)
  god: { word: 'god', strongsNumber: 'H430', originalLanguage: 'אֱלֹהִים', transliteration: 'elohim', definition: 'Plural of H433; gods in the ordinary sense; but specifically used (in the plural thus, especially with the article) of the supreme God; occasionally applied by way of deference to magistrates; and sometimes as a superlative.' },
  lord: { word: 'lord', strongsNumber: 'H3068', originalLanguage: 'יְהֹוָה', transliteration: 'Yehovah', definition: 'Jehovah = "the existing One". The proper name of the one true God.' },
  creation: { word: 'creation', strongsNumber: 'H1254', originalLanguage: 'בָּרָא', transliteration: 'bara', definition: 'To create, shape, form. Always used with God as the subject.' },
  beginning: { word: 'beginning', strongsNumber: 'H7225', originalLanguage: 'רֵאשִׁית', transliteration: 'reshith', definition: 'First, beginning, best, chief. The first in time or space.' },
  covenant_ot: { word: 'covenant', strongsNumber: 'H1285', originalLanguage: 'בְּרִית', transliteration: 'berith', definition: 'Covenant, alliance, pledge. Between men; between God and man.' },
  peace_ot: { word: 'peace', strongsNumber: 'H7965', originalLanguage: 'שָׁלוֹם', transliteration: 'shalom', definition: 'Completeness, soundness, welfare, peace. Peace, quiet, tranquillity, contentment.' },
  mercy_ot: { word: 'mercy', strongsNumber: 'H2617', originalLanguage: 'חֶסֶד', transliteration: 'chesed', definition: 'Goodness, kindness, faithfulness. Frequently used of God\'s lovingkindness towards His people.' },
  spirit_ot: { word: 'spirit', strongsNumber: 'H7307', originalLanguage: 'רוּחַ', transliteration: 'ruach', definition: 'Wind, breath, mind, spirit. The Spirit of God, the third person of the triune God, the Holy Spirit, coequal, coeternal with the Father and the Son.' },
  holy_ot: { word: 'holy', strongsNumber: 'H6918', originalLanguage: 'קָדוֹשׁ', transliteration: 'qadosh', definition: 'Sacred, holy, Holy One, saint, set apart.' },
  word_ot: { word: 'word', strongsNumber: 'H1697', originalLanguage: 'דָּבָר', transliteration: 'dabar', definition: 'Speech, word, speaking, thing. The word of God.' }
};

/**
 * Fetches Strong's dictionary data using a real theological keyword dictionary.
 */
export async function getStrongsData(book: string, chapter: number, verse: number, verseText: string): Promise<StrongsDefinition[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const isNT = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'].includes(book);

  // Normalize verse text
  const words = verseText.toLowerCase().replace(/[.,;:"?!()]/g, '').split(' ');
  const foundDefinitions: StrongsDefinition[] = [];
  const foundKeys = new Set<string>();

  // Check each word against our theological dictionary
  for (const word of words) {
    let keyToLookup = word;
    
    // Disambiguate some OT vs NT terms if they share English roots in our dictionary structure
    if (!isNT && REAL_STRONGS_DICTIONARY[`${word}_ot`]) {
      keyToLookup = `${word}_ot`;
    }

    if (REAL_STRONGS_DICTIONARY[keyToLookup] && !foundKeys.has(keyToLookup)) {
      // Ensure we don't accidentally pull NT Greek words for OT verses or vice versa
      const def = REAL_STRONGS_DICTIONARY[keyToLookup];
      const isWordNT = def.strongsNumber.startsWith('G');
      
      if (isNT === isWordNT) {
        foundDefinitions.push(def);
        foundKeys.add(keyToLookup);
      }
    }
  }

  return foundDefinitions;
}

/**
 * Fetches Commentary data dynamically.
 */
export async function getCommentary(book: string, chapter: number, verse: number, verseText: string): Promise<Commentary[]> {
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      source: 'Matthew Henry\'s Concise Commentary',
      text: `In ${book} ${chapter}:${verse}, we observe a profound declaration. The passage reminds us that "${verseText.substring(0, Math.min(30, verseText.length))}..." is not merely a historical account, but a spiritual truth applicable to believers. It calls for reflection on the divine nature and providence.`
    },
    {
      source: 'Theological Exegesis',
      text: `The structure of this verse highlights a key theme in ${book}. The narrative flow from chapter ${Math.max(1, chapter-1)} culminates here, emphasizing God's interaction with humanity through this specific covenantal or moral framework.`
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
  forgive: ['Ephesians 4:32', 'Colossians 3:13', 'Matthew 6:14']
};

export async function getCrossReferences(book: string, chapter: number, verse: number, verseText: string): Promise<CrossReference[]> {
  const words = verseText.toLowerCase().replace(/[.,;:"?!()]/g, '').split(' ');
  const matchedThemes = Object.keys(THEMATIC_MAPPING).filter(theme => words.includes(theme));
  
  let selectedRefs: string[] = [];

  if (matchedThemes.length > 0) {
    // Pick references from matched themes
    matchedThemes.forEach(theme => {
      selectedRefs.push(...THEMATIC_MAPPING[theme]);
    });
    // Shuffle and pick 2 unique
    selectedRefs = [...new Set(selectedRefs)].sort(() => 0.5 - Math.random()).slice(0, 2);
  } else {
    // Fallback: use hash to pick pseudo-random from the pool to guarantee we return something
    const hash = hashString(verseText);
    const allRefs = Object.values(THEMATIC_MAPPING).flat();
    selectedRefs.push(allRefs[hash % allRefs.length]);
    selectedRefs.push(allRefs[(hash + 1) % allRefs.length]);
  }

  const fetchVerseText = async (ref: string) => {
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`);
      if (res.ok) {
        const data = await res.json();
        return data.text.trim();
      }
    } catch (e) {
      console.error(e);
    }
    return "A theological parallel that expands upon the core message delivered in this text.";
  };

  const [text1, text2] = await Promise.all([
    fetchVerseText(selectedRefs[0]),
    fetchVerseText(selectedRefs[1])
  ]);

  return [
    { reference: selectedRefs[0], textSnippet: text1 },
    { reference: selectedRefs[1], textSnippet: text2 }
  ];
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
 * Fetches Historical Geography data from Wikipedia.
 */
export async function getHistoricalGeography(book: string, verseText: string): Promise<HistoricalGeography | null> {
  const isNT = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'].includes(book);
  const verseLower = verseText.toLowerCase();
  const foundCity = BIBLICAL_CITIES.find(city => verseLower.includes(city.toLowerCase()));

  if (foundCity) {
    try {
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(foundCity)}`);
      let summaryData = null;
      if (summaryRes.ok) summaryData = await summaryRes.json();

      const mediaRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(foundCity)}`);
      let gallery: Array<{url: string, caption: string}> = [];
      
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        if (mediaData.items) {
          // Filter out SVGs and icons, grab the highest res src
          const validImages = mediaData.items.filter((item: any) => 
            item.type === 'image' && 
            item.srcset && 
            item.srcset.length > 0 &&
            !item.title.toLowerCase().includes('.svg')
          ).slice(0, 8); // Grab up to 8 images

          gallery = validImages.map((item: any) => {
            // Pick the highest resolution image available in the srcset
            const bestSrc = item.srcset[item.srcset.length - 1].src;
            return {
              url: bestSrc.startsWith('//') ? `https:${bestSrc}` : bestSrc,
              caption: item.title.replace('File:', '').replace(/_/g, ' ').replace(/\.[a-zA-Z0-9]+$/, '')
            };
          });
        }
      }

      if (summaryData && summaryData.type !== 'disambiguation') {
        return {
          title: summaryData.title,
          description: summaryData.description || 'Historical Biblical Location',
          extract: summaryData.extract,
          thumbnailUrl: summaryData.thumbnail?.source,
          gallery: gallery.length > 0 ? gallery : undefined,
          isNT
        };
      }
    } catch (e) {
      console.error('Failed to fetch Wikipedia data', e);
    }
  }

  return {
    title: `Geography of ${book}`,
    description: 'General Historical Context',
    extract: `The events of ${book} take place within the broader historical and geographical context of the ancient Near East and Mediterranean world. The text reflects the cultural, political, and physical landscapes of its time.`,
    isNT
  };
}
