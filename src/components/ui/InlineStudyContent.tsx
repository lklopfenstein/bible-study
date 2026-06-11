'use client';

import { Map, FileText, X } from 'lucide-react';
import styles from './InlineStudyContent.module.css';

interface Props {
  type: 'note' | 'map';
  title: string;
  content: string;
  onClose: () => void;
}

export default function InlineStudyContent({ type, title, content, onClose }: Props) {
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
        {type === 'map' ? (
          <div className={styles.mapMock}>
            <p>Mock map integration from <strong>oldmapsonline.org</strong></p>
            <div className={styles.mapGraphic}>🗺️ {content}</div>
          </div>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
}
