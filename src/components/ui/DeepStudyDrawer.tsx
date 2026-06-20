'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import styles from './DeepStudyDrawer.module.css';
import { getStrongsData, getCommentary, getCrossReferences, getHistoricalGeography, StrongsDefinition, Commentary, CrossReference, HistoricalGeography } from '@/lib/studyApi';
import { BIBLE_BOOKS } from '@/lib/bibleData';
import { useAppMode } from '@/hooks/useAppMode';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  book: string;
  chapter: number;
  verseRef: string;
  verseText: string;
}

export default function DeepStudyDrawer({ isOpen, onClose, book, chapter, verseRef, verseText }: Props) {
  const { mode, addXp } = useAppMode();
  const [activeTab, setActiveTab] = useState<'strongs' | 'commentary' | 'crossref' | 'maps' | 'lore'>('strongs');
  
  const [loading, setLoading] = useState(false);
  const [strongs, setStrongs] = useState<StrongsDefinition[]>([]);
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [crossRefs, setCrossRefs] = useState<CrossReference[]>([]);
  const [geography, setGeography] = useState<HistoricalGeography | null>(null);
  const [lore, setLore] = useState<any>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fetch data when drawer opens or verse changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parse the first verse from the reference string (e.g. "1-5" -> 1)
        const firstVerseNum = parseInt(verseRef.split('-')[0]) || 1;
        const promises: Promise<any>[] = [
          getStrongsData(book, chapter, firstVerseNum, verseText),
          getCommentary(book, chapter, firstVerseNum, verseText),
          getCrossReferences(book, chapter, firstVerseNum, verseText),
          getHistoricalGeography(book, verseText)
        ];

        if (mode === 'explorer') {
          promises.push(
            fetch('/api/lore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ book, chapter })
            }).then(res => res.json()).catch(() => null)
          );
        }

        const results = await Promise.all(promises);
        
        if (isMounted) {
          setStrongs(results[0]);
          setCommentaries(results[1]);
          setCrossRefs(results[2]);
          setGeography(results[3]);
          if (mode === 'explorer' && results[4]) {
            setLore(results[4]);
          }
          if (mode === 'explorer') addXp(5); // Grant 5 XP for opening deep study
        }
      } catch (error) {
        console.error("Failed to fetch deep study data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [isOpen, book, chapter, verseRef]);

  if (!isOpen) return null;

  const realBookName = BIBLE_BOOKS.find(b => b.name.toLowerCase().replace(/ /g, '') === book.toLowerCase().replace(/ /g, ''))?.name || book;
  const reference = `${realBookName} ${chapter}:${verseRef}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Deep Study</h2>
            <p className={styles.subtitle}>{reference}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button className={activeTab === 'strongs' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('strongs')}>Original Words</button>
          <button className={activeTab === 'commentary' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('commentary')}>Commentary</button>
          <button className={activeTab === 'crossref' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('crossref')}>Cross-Refs</button>
          <button className={activeTab === 'maps' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('maps')}>Geography</button>
          {mode === 'explorer' && (
            <button className={activeTab === 'lore' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('lore')}>Epic Lore ⚔️</button>
          )}
        </div>

        <div className={styles.contentArea}>
          {loading ? (
            <div className={styles.loader}>
              <Loader2 size={32} className={styles.spin} />
              <p>Analyzing text and retrieving resources...</p>
            </div>
          ) : (
            <div className={styles.fade}>
              {activeTab === 'strongs' && (
                <div className={styles.strongsList}>
                  {strongs.length > 0 ? strongs.map((s, idx) => (
                    <div key={idx} className={styles.strongsCard}>
                      <div className={styles.strongsHeader}>
                        <span className={styles.strongsWord}>"{s.word}"</span>
                        <span className={styles.strongsBadge} title="Strong's Concordance Number">Strong's {s.strongsNumber}</span>
                      </div>
                      <div className={styles.strongsOriginal}>
                        <span className={styles.greekHebrew}>{s.originalLanguage}</span>
                        <span className={styles.transliteration}>({s.transliteration})</span>
                      </div>
                      <p className={styles.strongsDef}>{s.definition}</p>
                      <div style={{ marginTop: '12px' }}>
                        <a 
                          href={`/search?q=${encodeURIComponent(s.word)}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            color: 'var(--text-accent)',
                            textDecoration: 'none',
                            fontWeight: 500
                          }}
                        >
                          <Search size={14} style={{ marginRight: '4px' }} />
                          Search all occurrences of "{s.word}"
                        </a>
                      </div>
                    </div>
                  )) : (
                    <div className={styles.emptyState}>
                      <h4 style={{ color: 'var(--text-accent)', marginBottom: '8px' }}>No Theological Keywords</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        No major theological keywords (e.g., Agape, Logos, Shalom, Pneuma) were found in this specific verse selection. Try selecting a verse with foundational thematic concepts.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'commentary' && (
                <div className={styles.commentaryList}>
                  {commentaries.map((c, idx) => (
                    <div key={idx} className={styles.commentaryCard}>
                      <h4 className={styles.commentarySource}>{c.source}</h4>
                      <p className={styles.commentaryText}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'crossref' && (
                <div className={styles.crossRefList}>
                  {crossRefs.map((cr, idx) => (
                    <div key={idx} className={styles.crossRefCard}>
                      <h4 className={styles.crossRefTitle}>{cr.reference}</h4>
                      <p className={styles.crossRefText}>{cr.textSnippet}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'maps' && geography && (
                <div className={styles.mapsTab} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-accent)' }}>{geography.title}</h3>
                    <p style={{ margin: '0 0 16px 0', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{geography.description}</p>
                    <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-primary)' }}>{geography.extract}</p>
                  </div>

                  {/* Current World Map */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-accent)' }}>Current Map</h4>
                    <div className={styles.mapWidget} style={{ padding: 0, overflow: 'hidden', height: '250px' }}>
                      <iframe 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0, borderRadius: 'var(--radius-md)' }} 
                        loading="lazy" 
                        allowFullScreen 
                        referrerPolicy="no-referrer-when-downgrade" 
                        src={`https://www.google.com/maps?q=${encodeURIComponent((geography.title.startsWith('Geography') ? 'Jerusalem' : geography.title) + ', Middle East')}&output=embed`}
                      ></iframe>
                    </div>
                  </div>

                  {/* Historical World Map */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-accent)' }}>Historical Context Map</h4>
                    <div className={styles.mapWidget} style={{ padding: 0, overflow: 'hidden', height: 'auto' }}>
                      <img 
                        src={geography.isNT 
                          ? 'https://upload.wikimedia.org/wikipedia/commons/d/df/Roman_Empire_125.svg' 
                          : 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Ancient_Levant_routes.png'
                        } 
                        alt="Historical Map"
                        style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'zoom-in' }}
                        onClick={() => setEnlargedImage(geography.isNT 
                          ? 'https://upload.wikimedia.org/wikipedia/commons/d/df/Roman_Empire_125.svg' 
                          : 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Ancient_Levant_routes.png'
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lore' && mode === 'explorer' && lore && (
                <div className={styles.loreTab} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {lore.hero && (
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                      {/* Cool subtle background accent */}
                      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'var(--text-accent)', filter: 'blur(60px)', opacity: 0.2 }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{lore.hero.name}</h3>
                          <span style={{ color: 'var(--boho-sage)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{lore.hero.title}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>WEAPON</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lore.hero.weapon}</div>
                        </div>
                      </div>

                      <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                        {lore.hero.description}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STR</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-accent)' }}>{lore.hero.stats.strength}</div>
                        </div>
                        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>WIS</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{lore.hero.stats.wisdom}</div>
                        </div>
                        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CRG</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--boho-sage)' }}>{lore.hero.stats.courage}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {lore.tactics && (
                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', borderLeft: '4px solid var(--text-accent)' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚔️</span> Tactics & Strategy
                      </h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{lore.tactics}</p>
                    </div>
                  )}

                  {lore.creatures && lore.creatures.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-accent)' }}>Noteworthy Entities</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {lore.creatures.map((c: string, i: number) => (
                          <span key={i} style={{ background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '100px', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                            🐉 {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Image Lightbox */}
      {enlargedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '24px'
          }}
          onClick={() => setEnlargedImage(null)}
        >
          <button 
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
            }}
            onClick={(e) => { e.stopPropagation(); setEnlargedImage(null); }}
          >
            <X size={32} />
          </button>
          <img 
            src={enlargedImage} 
            alt="Enlarged view" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              borderRadius: '8px'
            }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
