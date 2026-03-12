import { useEffect, useRef, useCallback, useState } from 'react';

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE = 60 * 1000;         // warn 1 minute before

interface UseSessionTimeoutOptions {
  onTimeout: () => void;
  enabled?: boolean;
}

export function useSessionTimeout({ onTimeout, enabled = true }: UseSessionTimeoutOptions) {
  const [warningVisible, setWarningVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startTimers = useCallback(() => {
    if (!enabled) return;
    clearAllTimers();
    setWarningVisible(false);

    warningRef.current = setTimeout(() => {
      setWarningVisible(true);
      setSecondsLeft(60);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_DURATION - WARNING_BEFORE);

    timeoutRef.current = setTimeout(() => {
      setWarningVisible(false);
      onTimeout();
    }, TIMEOUT_DURATION);
  }, [enabled, clearAllTimers, onTimeout]);

  const resetTimer = useCallback(() => {
    startTimers();
  }, [startTimers]);

  const stayActive = useCallback(() => {
    setWarningVisible(false);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    const handleActivity = () => {
      if (!warningVisible) {
        resetTimer();
      }
    };

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    startTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearAllTimers();
    };
  }, [enabled, warningVisible, resetTimer, startTimers, clearAllTimers]);

  return { warningVisible, secondsLeft, stayActive };
}
