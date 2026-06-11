'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Map, BookMarked, User } from 'lucide-react';
import styles from './Navbar.module.css';
import { useUser } from '@/hooks/useUser';

export default function Navbar() {
  const [readHref, setReadHref] = useState('/read/genesis/1');
  const { user } = useUser();

  useEffect(() => {
    const saved = localStorage.getItem('bible-last-read');
    if (saved) {
      setReadHref(saved);
    }
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <span className={styles.logoText}>Study Bible</span>
        </Link>
      </div>
      <div className={styles.links}>
        <Link href={readHref} className={styles.link}>
          <BookOpen size={20} />
          <span>Read</span>
        </Link>
        <Link href="/profile" className={styles.link}>
          <User size={20} color={user ? 'var(--text-accent)' : 'currentColor'} />
          <span style={{ color: user ? 'var(--text-accent)' : 'inherit' }}>{user ? 'Account' : 'Profile'}</span>
        </Link>
      </div>
    </nav>
  );
}
