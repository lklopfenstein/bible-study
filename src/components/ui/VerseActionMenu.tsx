'use client';

import { useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Highlighter, Bookmark, FileText, Library } from 'lucide-react';
import styles from './VerseActionMenu.module.css';

interface Props {
  onClose: () => void;
  onHighlight: (color: string) => void;
  onBookmark: () => void;
  onAddNote: () => void;
  onDeepStudy: () => void;
}

export default function VerseActionMenu({ onClose, onHighlight, onBookmark, onAddNote, onDeepStudy }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, onClose);

  const colors = ['#fde68a', '#fbcfe8', '#bfdbfe', '#bbf7d0']; // yellow, pink, blue, green

  return (
    <div className={styles.menu} ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <div className={styles.actions}>
        <div className={styles.colorPicker}>
          <Highlighter size={16} />
          {colors.map(color => (
            <button 
              key={color} 
              className={styles.colorBtn} 
              style={{ backgroundColor: color }}
              onClick={() => { onHighlight(color); onClose(); }}
            />
          ))}
          <button className={styles.clearBtn} onClick={() => { onHighlight('transparent'); onClose(); }}>✕</button>
        </div>
        
        <div className={styles.divider} />
        
        <button className={styles.actionBtn} onClick={() => { onBookmark(); onClose(); }} title="Bookmark">
          <Bookmark size={16} />
        </button>
        
        <button className={styles.actionBtn} onClick={() => { onAddNote(); onClose(); }} title="Add Note">
          <FileText size={16} />
        </button>
        
        <div className={styles.divider} />

        <button className={styles.studyBtn} onClick={() => { onDeepStudy(); onClose(); }} title="Deep Study">
          <Library size={16} />
          <span>Study</span>
        </button>
      </div>
    </div>
  );
}
