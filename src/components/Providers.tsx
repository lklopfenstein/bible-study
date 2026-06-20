'use client';

import { ReactNode } from 'react';
import { AppModeProvider } from '@/hooks/useAppMode';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppModeProvider>
      {children}
    </AppModeProvider>
  );
}
