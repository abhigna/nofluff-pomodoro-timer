'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../hooks/useNotification';
import styles from './PomodoroTimer.module.css';
import dynamic from 'next/dynamic';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoro: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes in seconds
  longBreak: 15 * 60, // 15 minutes in seconds
};

// Create a client-only version of the component with no SSR
const PomodoroTimerClient: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.pomodoro);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const { requestPermission, sendNotification } = useNotification();
  const timerRef = useRef<number | null>(null);
  
  // Handle timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Reset timer when mode changes
  useEffect(() => {
    setTimeLeft(DEFAULT_SETTINGS[mode]);
    setIsActive(false);
  }, [mode]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    // Play a sound when timer completes
    try {
      const audio = new Audio('/timer-complete.mp3');
      audio.play().catch(e => console.warn('Could not play timer sound:', e));
    } catch (e) {
      console.warn('Audio playback not supported');
    }
    
    if (mode === 'pomodoro') {
      const newCount = pomodorosCompleted + 1;
      setPomodorosCompleted(newCount);
      
      // Send notification via Service Worker
      sendNotification(
        'Pomodoro completed!', 
        'Time for a break. You have completed ' + newCount + ' pomodoros.'
      );
      
      // After 4 pomodoros, take a long break
      if (newCount % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      // Send notification for break completion
      sendNotification(
        'Break completed!', 
        mode === 'shortBreak' ? 'Time to focus.' : 'Long break complete. Ready for a new session?'
      );
      setMode('pomodoro');
    }
  };
  
  useEffect(() => {
    // Request notification permission immediately when component mounts
    requestPermission().then(granted => {
      console.log('Notification permission granted:', granted);
    });
  }, [requestPermission]);

  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_SETTINGS[mode]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pomodoro</h1>
      
      <div className={styles.modeSelector}>
        <button 
          className={`${styles.modeButton} ${mode === 'pomodoro' ? styles.active : ''}`}
          onClick={() => setMode('pomodoro')}
        >
          Focus
        </button>
        <button 
          className={`${styles.modeButton} ${mode === 'shortBreak' ? styles.active : ''}`}
          onClick={() => setMode('shortBreak')}
        >
          Short
        </button>
        <button 
          className={`${styles.modeButton} ${mode === 'longBreak' ? styles.active : ''}`}
          onClick={() => setMode('longBreak')}
        >
          Long
        </button>
      </div>
      
      <div className={styles.timerDisplay}>
        {formatTime(timeLeft)}
      </div>
      
      <div className={styles.controls}>
        <button 
          className={styles.controlButton}
          onClick={toggleTimer}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          className={styles.controlButton}
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
      
      <div className={styles.stats}>
        Completed: {pomodorosCompleted}
      </div>
    </div>
  );
};

// Create a dynamic component with SSR disabled
export const PomodoroTimer = dynamic(
  () => Promise.resolve(PomodoroTimerClient),
  { ssr: false }
); 