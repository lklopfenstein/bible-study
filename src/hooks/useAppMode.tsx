'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './useUser';

export type AppMode = 'scholar' | 'explorer';

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  xp: number;
  addXp: (amount: number) => void;
  level: number;
  relics: string[];
  unlockRelic: (relicId: string) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const RELICS_DB: Record<string, Relic> = {
  'sling-of-david': { id: 'sling-of-david', name: 'Sling of David', description: 'Defeated a giant challenge by reading 5 battle chapters.', icon: '🎯' },
  'armor-of-god': { id: 'armor-of-god', name: 'Armor of God', description: 'Equipped for battle! Read Ephesians 6.', icon: '🛡️' },
  'scroll-of-isaiah': { id: 'scroll-of-isaiah', name: 'Scroll of Isaiah', description: 'Explored prophecy.', icon: '📜' },
  'two-tablets': { id: 'two-tablets', name: 'The Two Tablets', description: 'Studied the law in Exodus.', icon: '⛰️' },
  'jawbone': { id: 'jawbone', name: 'Jawbone of a Donkey', description: 'Read the epic tale of Samson.', icon: '🦴' }
};

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('scholar');
  const [xp, setXp] = useState(0);
  const [relics, setRelics] = useState<string[]>([]);
  const { user, supabase } = useUser();

  // Load from local storage initially for fast render
  useEffect(() => {
    const savedMode = localStorage.getItem('app-mode') as AppMode;
    if (savedMode === 'scholar' || savedMode === 'explorer') {
      setMode(savedMode);
    }
    const savedXp = parseInt(localStorage.getItem('app-xp') || '0', 10);
    setXp(savedXp);
    
    try {
      const savedRelics = JSON.parse(localStorage.getItem('app-relics') || '[]');
      if (Array.isArray(savedRelics)) setRelics(savedRelics);
    } catch(e) {}
  }, []);

  // Update body class based on mode
  useEffect(() => {
    if (mode === 'explorer') {
      document.body.classList.add('theme-explorer');
    } else {
      document.body.classList.remove('theme-explorer');
    }
    localStorage.setItem('app-mode', mode);
  }, [mode]);

  // Sync to/from Supabase if user exists
  useEffect(() => {
    if (!user) return;
    
    const syncData = async () => {
      // First try to fetch from DB
      const { data, error } = await supabase
        .from('user_data')
        .select('content, type')
        .eq('user_id', user.id)
        .in('type', ['xp', 'relics']);
        
      if (!error && data) {
        data.forEach(item => {
          if (item.type === 'xp') {
            const dbXp = parseInt(item.content, 10);
            if (dbXp > xp) setXp(dbXp); // Keep the highest XP
          }
          if (item.type === 'relics') {
            try {
              const dbRelics = JSON.parse(item.content);
              if (Array.isArray(dbRelics)) {
                setRelics(prev => Array.from(new Set([...prev, ...dbRelics])));
              }
            } catch(e) {}
          }
        });
      }
    };
    syncData();
  }, [user, supabase]);

  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount;
      localStorage.setItem('app-xp', newXp.toString());
      if (user) {
        supabase.from('user_data').upsert({ user_id: user.id, type: 'xp', content: newXp.toString() }).then();
      }
      return newXp;
    });
  };

  const unlockRelic = (relicId: string) => {
    if (!RELICS_DB[relicId]) return;
    
    setRelics(prev => {
      if (prev.includes(relicId)) return prev;
      const newRelics = [...prev, relicId];
      localStorage.setItem('app-relics', JSON.stringify(newRelics));
      if (user) {
        supabase.from('user_data').upsert({ user_id: user.id, type: 'relics', content: JSON.stringify(newRelics) }).then();
      }
      return newRelics;
    });
  };

  const level = Math.floor(xp / 100) + 1;

  return (
    <AppModeContext.Provider value={{ mode, setMode, xp, addXp, level, relics, unlockRelic }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
