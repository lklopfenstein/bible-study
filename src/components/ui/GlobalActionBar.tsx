'use client';

import { X, Highlighter, Bookmark as BookmarkIcon, FileText, Search } from 'lucide-react';
import { useState } from 'react';
import styles from './GlobalActionBar.module.css';

interface Props {
  selectedCount: number;
  onClear: () => void;
  onHighlight: (color: string) => void;
  onBookmark: () => void;
  onNote: () => void;
  onDeepStudy: () => void;
}

export default function GlobalActionBar({ selectedCount, onClear, onHighlight, onBookmark, onNote, onDeepStudy }: Props) {
  const [showPalette, setShowPalette] = useState(false);

  const colors = [
    { name: 'yellow', value: 'rgba(253, 224, 71, 0.4)' },
    { name: 'green', value: 'rgba(134, 239, 172, 0.4)' },
    { name: 'blue', value: 'rgba(147, 197, 253, 0.4)' },
    { name: 'pink', value: 'rgba(249, 168, 212, 0.4)' },
    { name: 'clear', value: 'transparent' }
  ];

  return (
    <div className={styles.actionBarWrapper}>
      <div className={styles.actionBar}>
        <div className={styles.selectionCount}>
          {selectedCount} selected
        </div>

        <div className={styles.divider} />

        {showPalette ? (
          <div className={styles.highlightPalette}>
            {colors.map(c => (
              <button 
                key={c.name}
                className={styles.colorBtn}
                style={{ backgroundColor: c.value === 'transparent' ? 'var(--bg-primary)' : c.value }}
                onClick={() => {
                  onHighlight(c.value);
                  setShowPalette(false);
                }}
                title={c.name}
              >
                {c.value === 'transparent' && <X size={14} style={{ margin: 'auto', color: 'var(--text-secondary)' }} />}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.actionGroup}>
            <button className={styles.actionButton} onClick={() => setShowPalette(true)}>
              <Highlighter size={20} />
              <span>Highlight</span>
            </button>
            <button className={styles.actionButton} onClick={onBookmark}>
              <BookmarkIcon size={20} />
              <span>Bookmark</span>
            </button>
            <button className={styles.actionButton} onClick={onNote}>
              <FileText size={20} />
              <span>Note</span>
            </button>
            <button className={styles.actionButton} onClick={onDeepStudy} style={{ color: 'var(--text-accent)' }}>
              <Search size={20} />
              <span>Deep Study</span>
            </button>
          </div>
        )}

        <div className={styles.divider} />

        <button className={styles.closeButton} onClick={onClear}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
