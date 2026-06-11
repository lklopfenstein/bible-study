const strongs = require('strongs');

const STOP_WORDS = new Set(['the','and','that','this','for','with','unto','upon','which','their','from','they','have','been','shall','will','were','what','when','where','who','whom','whose','there','here','then','than','also','into','about','above','after','again','against','all','any','because','before','could','should','would','down','even','every','good','great','like','many','more','most','much','must','never','only','other','our','out','over','same','some','such','through','under','very','well','your']);

function buildReverseIndex() {
  const index = {};
  for (const key of Object.keys(strongs)) {
    const entry = strongs[key];
    const defs = entry.kjv_def || '';
    
    // Extract pure words
    const words = defs.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
    
    for (const w of words) {
      if (w.length > 3 && !STOP_WORDS.has(w)) {
        if (!index[w]) index[w] = [];
        if (!index[w].includes(key) && index[w].length < 5) {
          index[w].push(key);
        }
      }
    }
  }
  return index;
}

const index = buildReverseIndex();
console.log("Matches for 'love':", index['love']?.map(k => `${k}: ${strongs[k].lemma} - ${strongs[k].kjv_def}`));
console.log("Matches for 'world':", index['world']?.map(k => `${k}: ${strongs[k].lemma} - ${strongs[k].kjv_def}`));
console.log("Matches for 'darkness':", index['darkness']?.map(k => `${k}: ${strongs[k].lemma} - ${strongs[k].kjv_def}`));
