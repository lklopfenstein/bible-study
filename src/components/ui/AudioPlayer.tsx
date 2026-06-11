'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, FastForward } from 'lucide-react';
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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    
    // Attempt to find a natural english voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Premium') || v.name.includes('Samantha') || v.name.includes('Alex')));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    } else {
      const defaultEn = voices.find(v => v.lang.startsWith('en'));
      if (defaultEn) utterance.voice = defaultEn;
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

  return (
    <div className={styles.audioPlayer}>
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
    </div>
  );
}
