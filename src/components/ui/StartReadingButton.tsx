'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/page.module.css';
import { useUser } from '@/hooks/useUser';

export default function StartReadingButton() {
  const [href, setHref] = useState('/read/genesis/1');
  const [isLoading, setIsLoading] = useState(true);
  const { user, supabase } = useUser();

  useEffect(() => {
    // First, set from local storage as fallback
    const saved = localStorage.getItem('bible-last-read');
    if (saved) setHref(saved);
    
    // Then attempt cloud sync if user is logged in
    const fetchCloudState = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_data')
          .select('content')
          .eq('user_id', user.id)
          .eq('type', 'last_read')
          .single();
          
        if (data && !error && data.content) {
          setHref(data.content);
          // Also sync back to local
          localStorage.setItem('bible-last-read', data.content);
        }
      }
      setIsLoading(false);
    };

    fetchCloudState();
  }, [user, supabase]);

  return (
    <Link href={href} className={styles.button} style={{ opacity: isLoading ? 0.7 : 1 }}>
      {isLoading ? 'Loading...' : 'Begin Reading'}
    </Link>
  );
}
