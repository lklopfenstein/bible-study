'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

export default function SaveReadingState({ book, chapter }: { book: string, chapter: number }) {
  const { user, supabase } = useUser();

  useEffect(() => {
    const url = `/read/${book}/${chapter}`;
    localStorage.setItem('bible-last-read', url);

    if (user) {
      // Sync to cloud
      (async () => {
        await supabase.from('user_data').delete()
          .match({ user_id: user.id, type: 'last_read' });
          
        await supabase.from('user_data').insert({
          user_id: user.id,
          book: book,
          chapter: chapter,
          verse: 0,
          type: 'last_read',
          content: url
        });
      })();
    }
  }, [book, chapter, user, supabase]);

  return null;
}
