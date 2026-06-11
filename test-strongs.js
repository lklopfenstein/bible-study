const strongs = require('strongs');

function buildReverseIndex() {
  const index = {};
  for (const key of Object.keys(strongs)) {
    const entry = strongs[key];
    const defs = (entry.kjv_def || '') + ' ' + (entry.strongs_def || '');
    
    // Extract pure words
    const words = defs.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
    
    for (const w of words) {
      if (w.length > 3) {
        if (!index[w]) index[w] = [];
        if (!index[w].includes(key)) {
          index[w].push(key);
        }
      }
    }
  }
  return index;
}

const index = buildReverseIndex();
console.log("Words in index:", Object.keys(index).length);
console.log("Matches for 'love':", index['love']);
console.log("Matches for 'world':", index['world']);
