'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Settings, BookOpen, Clock, Loader2, User as UserIcon } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export default function ProfilePage() {
  const { user, loading, supabase } = useUser();
  const [theme, setTheme] = useState('light');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
        setAuthError('Check your email to confirm your account!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <main className={styles.container} style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
        <Loader2 className={styles.spin} size={40} color="var(--text-accent)" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <UserIcon size={48} className={styles.authIcon} />
            <h2 className={styles.title}>{authMode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className={styles.subtitle}>Sign in to sync your notes and highlights securely across all devices.</p>
          </div>

          <form onSubmit={handleAuth} className={styles.authForm}>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.authInput}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.authInput}
              required
            />
            {authError && <p className={styles.authError}>{authError}</p>}
            <button type="submit" className={styles.authButton} disabled={authLoading}>
              {authLoading ? <Loader2 className={styles.spin} size={20} /> : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className={styles.authToggle}>
            <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className={styles.authToggleButton}>
              {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>My Profile</h1>
        <button onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
      </div>
      
      <div className={styles.settingsSection} style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Logged in as: <strong>{user.email}</strong></p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-accent)', marginTop: '8px' }}>Your data is securely syncing to the cloud.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <BookOpen size={32} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>-</span>
            <span className={styles.statLabel}>Saved Items</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Clock size={32} className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>Cloud</span>
            <span className={styles.statLabel}>Sync Status</span>
          </div>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h2 className={styles.sectionTitle}>
          <Settings size={20} /> Settings
        </h2>
        
        <div className={styles.settingItem}>
          <span>Appearance</span>
          <button onClick={toggleTheme} className={styles.themeToggle}>
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          </button>
        </div>
      </div>
    </main>
  );
}
