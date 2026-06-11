'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/page.module.css';
import { useUser } from '@/hooks/useUser';

export default function StartReadingButton() {
  const [href, setHref] = useState('/read/genesis/1');
  const [isSyncing, setIsSyncing] = useState(true);
  const { user, loading, supabase } = useUser();

  useEffect(() => {
    // Wait until auth state is determined before doing cloud sync
    if (loading) return;

    // Set local fallback first so we have *something* immediately
    const saved = localStorage.getItem('bible-last-read');
    if (saved) setHref(saved);
    
    const fetchCloudState = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_data')
          .select('content')
          .eq('user_id', user.id)
          .eq('type', 'last_read')
          .limit(1);
          
        if (data && data.length > 0 && !error && data[0].content) {
          setHref(data[0].content);
          // Sync back down to local storage
          localStorage.setItem('bible-last-read', data[0].content);
        } else if (error) {
          console.error("StartReadingButton cloud sync error:", error);
        }
      }
      setIsSyncing(false);
    };

    fetchCloudState();
  }, [user, loading, supabase]);

  return (
    <Link href={href} className={styles.button} style={{ opacity: isSyncing || loading ? 0.7 : 1 }}>
      {isSyncing || loading ? 'Syncing...' : 'Begin Reading'}
    </Link>
  );
}
