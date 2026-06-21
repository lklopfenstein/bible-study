'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Map, BookMarked, User, Search, Settings } from 'lucide-react';
import styles from './Navbar.module.css';
import { useUser } from '@/hooks/useUser';
import { useAppMode } from '@/hooks/useAppMode';

export default function Navbar() {
  const router = useRouter();
  const [readHref, setReadHref] = useState('/read/genesis/1');
  const { user, loading, supabase } = useUser();

  const { mode, setMode, xp, level } = useAppMode();

  useEffect(() => {
    // Wait until auth state is determined
    if (loading) return;

    // Set local fallback first
    const saved = localStorage.getItem('bible-last-read');
    if (saved) {
      setReadHref(saved);
    }

    // Attempt cloud sync if user is logged in
    const fetchCloudState = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_data')
          .select('content')
          .eq('user_id', user.id)
          .eq('type', 'last_read')
          .limit(1);
          
        if (data && data.length > 0 && !error && data[0].content) {
          setReadHref(data[0].content);
          localStorage.setItem('bible-last-read', data[0].content);
        }
      }
    };

    fetchCloudState();
  }, [user, loading, supabase]);

  const toggleMode = () => {
    setMode(mode === 'scholar' ? 'explorer' : 'scholar');
  };

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>Study Bible</span>
          </Link>
        </div>
        
        {mode === 'explorer' && (
          <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
            <span className="text-[var(--boho-sage)] font-bold text-sm">Lvl {level}</span>
            <div className="w-20 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--text-accent)] transition-all duration-500" 
                style={{ width: `${(xp % 100)}%` }} 
              />
            </div>
            <span className="text-[var(--text-secondary)] text-xs">{xp} XP</span>
          </div>
        )}

        <div className={styles.links}>
          <button 
            onClick={toggleMode} 
            className={styles.link} 
            title="Toggle App Mode"
            style={{ fontSize: '1.2rem' }}
          >
            {mode === 'scholar' ? '📖' : '🛡️'}
          </button>

          <Link href="/search" className={styles.link}>
            <Search size={20} />
            <span className="hidden sm:inline">Search</span>
          </Link>
          
          {mode === 'explorer' && (
            <Link href="/quests" className={styles.link} style={{ color: 'var(--boho-sage)' }}>
              <Map size={20} />
              <span className="hidden sm:inline">Quests</span>
            </Link>
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              const freshHref = localStorage.getItem('bible-last-read') || readHref;
              router.push(freshHref);
            }} 
            className={styles.link}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}
          >
            <BookOpen size={20} />
            <span>Read</span>
          </button>
          <Link href="/settings" className={styles.link}>
            <Settings size={20} />
            <span className="hidden sm:inline">Offline</span>
          </Link>
          <Link href="/profile" className={styles.link}>
            <User size={20} color={user ? 'var(--text-accent)' : 'currentColor'} />
            <span style={{ color: user ? 'var(--text-accent)' : 'inherit' }}>{user ? 'Account' : 'Profile'}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
