'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Settings, BookOpen, Clock } from 'lucide-react';

export default function ProfilePage() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>My Profile</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <BookOpen size={32} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>15</span>
            <span className={styles.statLabel}>Chapters Read</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Clock size={32} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>3</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Settings size={20} /> Settings
        </h2>
        
        <div className={styles.settingItem}>
          <span>Appearance</span>
          <button onClick={toggleTheme} className={styles.themeToggle}>
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          </button>
        </div>
      </div>
    </main>
  );
}
