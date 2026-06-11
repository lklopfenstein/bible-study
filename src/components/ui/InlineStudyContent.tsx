'use client';

import { useState, useEffect } from 'react';
import { Map, FileText, X, Check } from 'lucide-react';
import styles from './InlineStudyContent.module.css';

interface Props {
  type: 'note' | 'map';
  title: string;
  initialContent: string;
  onClose: () => void;
  onSaveNote?: (text: string) => void;
}

export default function InlineStudyContent({ type, title, initialContent, onClose, onSaveNote }: Props) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if initialContent changes (e.g. cloud loaded)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    if (onSaveNote) {
      setIsSaving(true);
      onSaveNote(content);
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  return (
    <div className={styles.inlineContainer}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          {type === 'map' ? <Map size={18} /> : <FileText size={18} />}
          <strong>{title}</strong>
        </div>
        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
      </div>
      
      <div className={styles.content}>
        {type === 'note' ? (
          <div className={styles.noteEditor}>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your study notes here..."
              className={styles.textArea}
              rows={4}
            />
            <div className={styles.noteActions}>
              <button 
                className={styles.saveBtn} 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <><Check size={16}/> Saved</> : 'Save Note'}
              </button>
            </div>
          </div>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
}
