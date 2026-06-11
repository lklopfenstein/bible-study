'use client';

import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { DownloadCloud, CheckCircle, Trash2, WifiOff } from 'lucide-react';
import Link from 'next/link';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if bible is already downloaded
    localforage.getItem('bible_data_web').then((data) => {
      if (data) {
        setDownloadState('completed');
      }
    });
  }, []);

  const handleDownload = async () => {
    try {
      setDownloadState('downloading');
      setProgress(10);
      
      const response = await fetch('/data/bible.json');
      if (!response.ok) throw new Error("Failed to fetch bible dataset");
      
      setProgress(50);
      const data = await response.json();
      
      setProgress(80);
      await localforage.setItem('bible_data_web', data);
      
      setProgress(100);
      setDownloadState('completed');
    } catch (e) {
      console.error(e);
      setDownloadState('error');
    }
  };

  const handleClear = async () => {
    await localforage.removeItem('bible_data_web');
    setDownloadState('idle');
    setProgress(0);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardInfo}>
            <h2 className={styles.cardTitle}>
              <WifiOff className={styles.icon} size={24} />
              Offline Mode
            </h2>
            <p className={styles.cardDescription}>
              Download the full World English Bible translation to your device. This enables lightning-fast Global Search and allows you to read without an internet connection.
            </p>
          </div>
          
          <div className={styles.cardActions}>
            {downloadState === 'completed' ? (
              <>
                <span className={styles.downloadedBadge}>
                  <CheckCircle size={16} /> Downloaded
                </span>
                <button 
                  onClick={handleClear}
                  className={styles.removeBtn}
                >
                  <Trash2 size={14} /> Remove Data
                </button>
              </>
            ) : (
              <button
                onClick={handleDownload}
                disabled={downloadState === 'downloading'}
                className={styles.downloadBtn}
              >
                <DownloadCloud size={18} />
                {downloadState === 'downloading' ? 'Downloading...' : 'Download (4.5MB)'}
              </button>
            )}
          </div>
        </div>
        
        {downloadState === 'downloading' && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={styles.progressText}>{progress}% Complete</p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Link href="/" className={styles.returnLink}>
          Return to Reading
        </Link>
      </div>
    </div>
  );
}
