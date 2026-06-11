'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import styles from './DeepStudyDrawer.module.css';
import { getStrongsData, getCommentary, getCrossReferences, StrongsDefinition, Commentary, CrossReference } from '@/lib/studyApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
}

export default function DeepStudyDrawer({ isOpen, onClose, book, chapter, verse, verseText }: Props) {
  const [activeTab, setActiveTab] = useState<'strongs' | 'commentary' | 'crossref' | 'maps'>('strongs');
  
  const [loading, setLoading] = useState(false);
  const [strongs, setStrongs] = useState<StrongsDefinition[]>([]);
  const [commentaries, setCommentaries] = useState<Commentary[]>([]);
  const [crossRefs, setCrossRefs] = useState<CrossReference[]>([]);

  // Fetch data when drawer opens or verse changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sData, cData, crData] = await Promise.all([
          getStrongsData(book, chapter, verse, verseText),
          getCommentary(book, chapter, verse, verseText),
          getCrossReferences(book, chapter, verse, verseText)
        ]);
        if (isMounted) {
          setStrongs(sData);
          setCommentaries(cData);
          setCrossRefs(crData);
        }
      } catch (error) {
        console.error("Failed to fetch deep study data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [isOpen, book, chapter, verse]);

  if (!isOpen) return null;

  const reference = `${book.charAt(0).toUpperCase() + book.slice(1)} ${chapter}:${verse}`;

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
                  {strongs.map((s, idx) => (
                    <div key={idx} className={styles.strongsCard}>
                      <div className={styles.strongsHeader}>
                        <span className={styles.strongsWord}>"{s.word}"</span>
                        <span className={styles.strongsBadge}>{s.strongsNumber}</span>
                      </div>
                      <div className={styles.strongsOriginal}>
                        <span className={styles.greekHebrew}>{s.originalLanguage}</span>
                        <span className={styles.transliteration}>({s.transliteration})</span>
                      </div>
                      <p className={styles.strongsDef}>{s.definition}</p>
                    </div>
                  ))}
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

              {activeTab === 'maps' && (
                <div className={styles.mapsTab}>
                  <p className={styles.mapsIntro}>
                    Relevant geographical data for {reference} via <strong>Google Maps</strong>.
                  </p>
                  <div className={styles.mapWidget} style={{ padding: 0, overflow: 'hidden' }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, borderRadius: 'var(--radius-md)' }} 
                      loading="lazy" 
                      allowFullScreen 
                      referrerPolicy="no-referrer-when-downgrade" 
                      src={`https://www.google.com/maps?q=Biblical+locations+in+${book}+chapter+${chapter}&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
