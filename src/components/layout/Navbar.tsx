'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Map, BookMarked, User, Search, Settings } from 'lucide-react';
import styles from './Navbar.module.css';
import { useUser } from '@/hooks/useUser';

export default function Navbar() {
  const [readHref, setReadHref] = useState('/read/genesis/1');
  const { user, loading, supabase } = useUser();

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

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <span className={styles.logoText}>Study Bible</span>
        </Link>
      </div>
      <div className={styles.links}>
        <Link href="/search" className={styles.link}>
          <Search size={20} />
          <span className="hidden sm:inline">Search</span>
        </Link>
        <Link href={readHref} className={styles.link}>
          <BookOpen size={20} />
          <span>Read</span>
        </Link>
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
  );
}
