'use client';

import { useEffect } from 'react';
import { useAppMode } from '@/hooks/useAppMode';

export default function GrantXp({ amount, reason }: { amount: number, reason?: string }) {
  const { mode, addXp } = useAppMode();

  useEffect(() => {
    if (mode === 'explorer') {
      addXp(amount);
    }
  }, [mode, addXp, amount]);

  return null;
}
