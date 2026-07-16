'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}

export function Reveal({ children, delay = 0, duration = 0.5, y = 20 }: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
