'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks';

interface InteractiveHeroCardProps {
  children: React.ReactNode;
  bgColor: string;
}

export default function InteractiveHeroCard({ children, bgColor }: InteractiveHeroCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Detect if the device has a fine pointer (like a mouse) rather than touch-only
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  // Return static card if user prefers reduced motion or is on touch device
  if (prefersReducedMotion || !isFinePointer) {
    return (
      <div
        className="rounded-[2rem] overflow-hidden relative transition-all duration-300"
        style={{
          background: 'var(--bg-card)',
          border: `4px solid var(--text-primary)`,
          boxShadow: `12px 12px 0px var(--text-primary)`,
        }}
      >
        {children}
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = containerRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = x / rect.width;
    const percentY = y / rect.height;

    // Angle calculations (max 8 degrees tilt)
    const maxRotation = 8;
    const rotateY = (percentX - 0.5) * maxRotation * 2; // -8deg to +8deg
    const rotateX = (0.5 - percentY) * maxRotation * 2; // -8deg to +8deg

    // Update CSS custom properties directly on the style object
    card.style.setProperty('--pointer-x', `${x}px`);
    card.style.setProperty('--pointer-y', `${y}px`);
    card.style.setProperty('--glow-opacity', '0.15');

    // Subtle 3D tilt
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Counter parallax for the sprite
    const sprite = card.querySelector('[data-hero-sprite]') as HTMLElement;
    if (sprite) {
      const moveX = (percentX - 0.5) * -15; // move -7.5px to 7.5px (opposite)
      const moveY = (percentY - 0.5) * -15;
      sprite.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
    }
  };

  const handleMouseLeave = () => {
    const card = containerRef.current;
    if (!card) return;

    // Smooth return transition
    card.style.transition = 'transform 300ms ease-out, box-shadow 300ms ease-out';
    card.style.setProperty('--glow-opacity', '0');
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

    const sprite = card.querySelector('[data-hero-sprite]') as HTMLElement;
    if (sprite) {
      sprite.style.transition = 'transform 300ms ease-out';
      sprite.style.transform = 'translate3d(0px, 0px, 0px)';
    }
  };

  const handleMouseEnter = () => {
    const card = containerRef.current;
    if (!card) return;

    // Remove transition so tracking is instantaneous
    card.style.transition = 'none';

    const sprite = card.querySelector('[data-hero-sprite]') as HTMLElement;
    if (sprite) {
      sprite.style.transition = 'none';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-[2rem] overflow-hidden relative select-none"
      style={{
        background: 'var(--bg-card)',
        border: `4px solid var(--text-primary)`,
        boxShadow: `12px 12px 0px var(--text-primary)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 300ms ease-out, box-shadow 300ms ease-out',
      }}
    >
      {/* Radial glow layer */}
      <div
        className="absolute inset-0 pointer-events-none z-content"
        style={{
          background: `radial-gradient(circle 250px at var(--pointer-x, 50%) var(--pointer-y, 50%), ${bgColor}aa, transparent)`,
          opacity: 'var(--glow-opacity, 0)',
          transition: 'opacity 300ms ease-out',
          mixBlendMode: 'color-dodge',
        }}
      />
      {children}
    </div>
  );
}
