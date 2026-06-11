'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function StartReadingButton() {
  const [href, setHref] = useState('/read/genesis/1');

  useEffect(() => {
    const saved = localStorage.getItem('bible-last-read');
    if (saved) {
      setHref(saved);
    }
  }, []);

  return (
    <Link href={href} className={styles.button}>
      Begin Reading
    </Link>
  );
}
