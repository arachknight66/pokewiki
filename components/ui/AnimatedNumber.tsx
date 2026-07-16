'use client';

import React, { useEffect, useRef } from 'react';
import { animate, useMotionValue, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, duration = 1, className = '' }: AnimatedNumberProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      if (elementRef.current) {
        elementRef.current.textContent = String(value);
      }
      return;
    }

    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, duration, count, prefersReducedMotion]);

  useEffect(() => {
    if (!prefersReducedMotion) {
      return rounded.on('change', (latest) => {
        if (elementRef.current) {
          elementRef.current.textContent = String(latest);
        }
      });
    }
  }, [rounded, prefersReducedMotion]);

  return <span ref={elementRef} className={className}>{prefersReducedMotion ? value : 0}</span>;
}
