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
        // Try to get all existing last_read records to update the first and delete rest
        const { data: existing } = await supabase.from('user_data')
          .select('id')
          .match({ user_id: user.id, type: 'last_read' });

        if (existing && existing.length > 0) {
          // Update the first one
          await supabase.from('user_data').update({
            book: book,
            chapter: chapter,
            content: url
          }).eq('id', existing[0].id);
          
          // Clean up any stray duplicates that might have been created by previous bugs
          if (existing.length > 1) {
            for (let i = 1; i < existing.length; i++) {
              await supabase.from('user_data').delete().eq('id', existing[i].id);
            }
          }
        } else {
          // Doesn't exist, insert new
          await supabase.from('user_data').insert({
            user_id: user.id,
            book: book,
            chapter: chapter,
            verse: 0,
            type: 'last_read',
            content: url
          });
        }
      })();
    }
  }, [book, chapter, user, supabase]);

  return null;
}
