'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import styles from './DeepStudyDrawer.module.css';
import { getStrongsData, getCommentary, getCrossReferences, getHistoricalGeography, StrongsDefinition, Commentary, CrossReference, HistoricalGeography } from '@/lib/studyApi';

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
  const [geography, setGeography] = useState<HistoricalGeography | null>(null);

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
        const [sData, cData, crData, gData] = await Promise.all([
          getStrongsData(book, chapter, verse, verseText),
          getCommentary(book, chapter, verse, verseText),
          getCrossReferences(book, chapter, verse, verseText),
          getHistoricalGeography(book, verseText)
        ]);
        if (isMounted) {
          setStrongs(sData);
          setCommentaries(cData);
          setCrossRefs(crData);
          setGeography(gData);
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

              {activeTab === 'maps' && geography && (
                <div className={styles.mapsTab} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Image Gallery */}
                  {geography.gallery && geography.gallery.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-accent)' }}>Visual Context</h4>
                      <div className={styles.galleryWrapper}>
                        {geography.gallery.map((img, idx) => (
                          <div key={idx} className={styles.galleryItem}>
                            <div className={styles.galleryImageWrapper}>
                              <img src={img.url} alt={img.caption} className={styles.galleryImage} />
                            </div>
                            <div className={styles.galleryCaption} title={img.caption}>
                              {img.caption}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-accent)' }}>{geography.title}</h3>
                    <p style={{ margin: '0 0 16px 0', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{geography.description}</p>
                    
                    {geography.thumbnailUrl && (!geography.gallery || geography.gallery.length === 0) && (
                      <div style={{ marginBottom: '16px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', height: '200px' }}>
                        <img 
                          src={geography.thumbnailUrl} 
                          alt={geography.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    
                    <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-primary)' }}>{geography.extract}</p>
                    <p style={{ margin: '16px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                      <em>Source: Wikimedia/Wikipedia REST API</em>
                    </p>
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
