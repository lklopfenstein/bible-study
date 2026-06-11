'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, FastForward, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './AudioPlayer.module.css';

interface Props {
  text: string;
  nextLink: string;
}

export default function AudioPlayer({ text, nextLink }: Props) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load voices and preferences
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(availableVoices);
      
      const savedURI = localStorage.getItem('bible-audio-voice');
      if (savedURI && availableVoices.some(v => v.voiceURI === savedURI)) {
        setSelectedVoiceURI(savedURI);
      } else if (availableVoices.length > 0) {
        // Fallback to premium/default
        const premium = availableVoices.find(v => v.name.includes('Premium') || v.name.includes('Samantha') || v.name.includes('Alex'));
        setSelectedVoiceURI(premium ? premium.voiceURI : availableVoices[0].voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Click outside to close settings
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Stop any ongoing speech when component unmounts or text changes
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  const initUtterance = () => {
    // Strip out unnecessary punctuation/newlines for smoother reading
    const cleanText = text.replace(/[\r\n]+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Use selected voice
    const voiceToUse = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    utterance.rate = speed;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      // Auto-advance to next chapter if available
      if (nextLink) {
        router.push(nextLink);
      }
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    return utterance;
  };

  const togglePlay = () => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      const utterance = initUtterance();
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const stopPlay = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const cycleSpeed = () => {
    let newSpeed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(newSpeed);
    
    if (isPlaying) {
      // Must restart utterance to apply new rate in most browsers
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const utterance = initUtterance();
        utterance.rate = newSpeed;
        window.speechSynthesis.speak(utterance);
        setIsPaused(false);
      }, 50);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newURI = e.target.value;
    setSelectedVoiceURI(newURI);
    localStorage.setItem('bible-audio-voice', newURI);
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const utterance = initUtterance();
        utterance.voice = voices.find(v => v.voiceURI === newURI) || null;
        window.speechSynthesis.speak(utterance);
        setIsPaused(false);
      }, 50);
    }
  };

  return (
    <div className={styles.audioPlayer} ref={containerRef}>
      <button className={styles.btn} onClick={togglePlay} aria-label={isPlaying && !isPaused ? "Pause" : "Play"}>
        {isPlaying && !isPaused ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      {isPlaying && (
        <button className={styles.btn} onClick={stopPlay} aria-label="Stop">
          <Square size={20} />
        </button>
      )}

      <button className={styles.speedBtn} onClick={cycleSpeed} aria-label="Playback Speed">
        <FastForward size={16} />
        <span>{speed}x</span>
      </button>

      <div className={styles.settingsWrapper}>
        <button className={styles.btn} onClick={() => setShowSettings(!showSettings)} aria-label="Settings">
          <Settings size={18} />
        </button>
        
        {showSettings && (
          <div className={styles.settingsDropdown}>
            <label className={styles.settingsLabel}>Reader Voice</label>
            <select 
              value={selectedVoiceURI} 
              onChange={handleVoiceChange}
              className={styles.voiceSelect}
            >
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
