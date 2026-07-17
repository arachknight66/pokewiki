'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Toast } from '@/components/ui/Toast';
import { usePrefersReducedMotion } from '@/hooks';

interface ShinyModeContextType {
  isShinyMode: boolean;
  toggleShinyMode: () => void;
}

const ShinyModeContext = createContext<ShinyModeContextType | undefined>(undefined);

export function ShinyModeProvider({ children }: { children: React.ReactNode }) {
  const [isShinyMode, setIsShinyMode] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Reset shiny mode on pathname change (route change)
  useEffect(() => {
    setIsShinyMode(false);
    setShowSparkles(false);
  }, [pathname]);

  const toggleShinyMode = useCallback(() => {
    setIsShinyMode((prev) => {
      const next = !prev;
      if (next) {
        setToastMessage('✨ A shiny appeared!');
        if (!prefersReducedMotion) {
          setShowSparkles(true);
          setTimeout(() => setShowSparkles(false), 2000);
        }
      } else {
        setToastMessage('Shiny mode deactivated.');
        setShowSparkles(false);
      }
      return next;
    });
  }, [prefersReducedMotion]);

  // Konami code keydown listener
  useEffect(() => {
    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let inputSequence: string[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const targetKey = konamiCode[inputSequence.length];

      // Match character (b / a case insensitive)
      const isMatch =
        key === targetKey ||
        (targetKey.toLowerCase() === key.toLowerCase() &&
          (key.toLowerCase() === 'b' || key.toLowerCase() === 'a'));

      if (isMatch) {
        inputSequence.push(targetKey);
        if (inputSequence.length === konamiCode.length) {
          toggleShinyMode();
          inputSequence = [];
        }
      } else {
        // Reset sequence or check if key restarts it
        const restartMatch = key === konamiCode[0];
        inputSequence = restartMatch ? [konamiCode[0]] : [];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleShinyMode]);

  return (
    <ShinyModeContext.Provider value={{ isShinyMode, toggleShinyMode }}>
      {children}
      {showSparkles && (
        <div className="fixed inset-0 pointer-events-none z-sparkle overflow-hidden">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes sparkleFloat {
              0% { transform: translate(0, 100vh) scale(0) rotate(0deg); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translate(var(--x-offset), -10vh) scale(var(--scale)) rotate(var(--rotate)); opacity: 0; }
            }
            .sparkle-particle {
              position: absolute;
              bottom: -40px;
              animation: sparkleFloat 2s linear forwards;
              color: var(--accent-gold);
              font-size: 24px;
            }
          ` }} />
          {Array.from({ length: 25 }).map((_, i) => {
            const xPos = Math.random() * 100;
            const xOffset = (Math.random() - 0.5) * 40;
            const scale = 0.5 + Math.random() * 1.5;
            const rotate = Math.random() * 360;
            const delay = Math.random() * 0.8;
            return (
              <div
                key={i}
                className="sparkle-particle"
                style={{
                  left: `${xPos}%`,
                  animationDelay: `${delay}s`,
                  '--x-offset': `${xOffset}vw`,
                  '--scale': scale,
                  '--rotate': `${rotate}deg`,
                } as any}
              >
                ✨
              </div>
            );
          })}
        </div>
      )}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </ShinyModeContext.Provider>
  );
}

export function useShinyMode() {
  const context = useContext(ShinyModeContext);
  if (context === undefined) {
    throw new Error('useShinyMode must be used within a ShinyModeProvider');
  }
  return context;
}
