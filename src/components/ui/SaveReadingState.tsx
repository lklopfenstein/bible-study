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
        const { error: delError } = await supabase.from('user_data').delete()
          .match({ user_id: user.id, type: 'last_read' });
          
        const { error: insError } = await supabase.from('user_data').insert({
          user_id: user.id,
          book: book,
          chapter: chapter,
          verse: 0,
          type: 'last_read',
          content: url
        });
        
        if (delError || insError) {
          console.error("SaveReadingState sync error:", delError, insError);
        }
      })();
    }
  }, [book, chapter, user, supabase]);

  return null;
}
