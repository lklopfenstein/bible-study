'use client';

import { useEffect } from 'react';

export default function SaveReadingState({ book, chapter }: { book: string, chapter: number }) {
  useEffect(() => {
    localStorage.setItem('bible-last-read', `/read/${book}/${chapter}`);
  }, [book, chapter]);

  return null;
}
