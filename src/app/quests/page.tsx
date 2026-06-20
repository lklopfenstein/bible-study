'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppMode, RELICS_DB } from '@/hooks/useAppMode';
import { useRouter } from 'next/navigation';
import { ChevronRight, Shield, Scroll, CheckCircle } from 'lucide-react';

const QUEST_LINES = [
  {
    id: 'warriors-path',
    title: "The Warrior's Path",
    description: "Follow the epic conquests of Joshua and the Judges. A path of blood, faith, and jawbones.",
    icon: <Shield size={24} />,
    color: '#F59E0B',
    chapters: [
      { book: 'Joshua', chapter: 6, title: "The Walls of Jericho" },
      { book: 'Judges', chapter: 7, title: "Gideon's 300" },
      { book: 'Judges', chapter: 15, title: "Samson's Jawbone" },
      { book: '1 Samuel', chapter: 17, title: "David & Goliath" }
    ],
    relicReward: 'jawbone',
    xpReward: 500
  },
  {
    id: 'prophets-path',
    title: "The Prophet's Path",
    description: "Fire from heaven, floating ax heads, and showdowns with false gods.",
    icon: <Scroll size={24} />,
    color: '#38BDF8',
    chapters: [
      { book: '1 Kings', chapter: 18, title: "Elijah on Mt. Carmel" },
      { book: '2 Kings', chapter: 2, title: "Chariots of Fire" },
      { book: '2 Kings', chapter: 6, title: "The Blinding of the Arameans" },
      { book: 'Daniel', chapter: 6, title: "The Lion's Den" }
    ],
    relicReward: 'scroll-of-isaiah',
    xpReward: 500
  }
];

export default function QuestsPage() {
  const { mode, addXp, unlockRelic, relics } = useAppMode();
  const router = useRouter();
  
  if (mode !== 'explorer') {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <h2>Quests are only available in Explorer Mode</h2>
        <p>Toggle mode from the navigation bar to access Quests.</p>
      </div>
    );
  }

  const handleCompleteQuest = (quest: typeof QUEST_LINES[0]) => {
    addXp(quest.xpReward);
    unlockRelic(quest.relicReward);
    alert(`Epic! You gained ${quest.xpReward} XP and unlocked the ${RELICS_DB[quest.relicReward].name} relic!`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 800 }}>Quest Log</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
        Complete these curated reading paths to earn massive XP and unlock legendary relics.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {QUEST_LINES.map(quest => {
          const isCompleted = relics.includes(quest.relicReward);
          
          return (
            <div 
              key={quest.id} 
              style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: `1px solid ${isCompleted ? 'var(--boho-sage)' : 'var(--border-color)'}`
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: quest.color }}>
                    {quest.icon}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {quest.title} {isCompleted && <CheckCircle size={20} color="var(--boho-sage)" />}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{quest.description}</p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-accent)', fontWeight: 'bold' }}>+{quest.xpReward} XP</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Reward: {RELICS_DB[quest.relicReward].icon}</div>
                </div>
              </div>
              
              <div style={{ padding: '24px', background: 'var(--bg-primary)' }}>
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Chapters to Read</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {quest.chapters.map((chap, i) => (
                    <Link 
                      key={i} 
                      href={`/read/${chap.book.toLowerCase()}/${chap.chapter}`}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 16px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        textDecoration: 'none'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{chap.book} {chap.chapter}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{chap.title}</div>
                      </div>
                      <ChevronRight size={16} color="var(--text-accent)" />
                    </Link>
                  ))}
                </div>
                
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleCompleteQuest(quest)}
                    disabled={isCompleted}
                    style={{
                      background: isCompleted ? 'var(--bg-secondary)' : 'var(--text-accent)',
                      color: isCompleted ? 'var(--text-secondary)' : 'var(--bg-primary)',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: isCompleted ? 'default' : 'pointer',
                      border: 'none',
                      width: '100%',
                      maxWidth: '300px'
                    }}
                  >
                    {isCompleted ? 'Quest Completed' : 'Claim Reward (Dev Test)'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
