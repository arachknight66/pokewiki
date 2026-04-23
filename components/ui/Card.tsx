/**
 * UI Components - Card — Cel-shaded glassmorphism
 */

'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glowColor?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, glowColor, className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          ${hoverable ? 'glass-card-glow cursor-pointer' : 'glass-card'}
          p-6
          ${className}
        `}
        style={{
          ...(glowColor ? { '--glow-color': glowColor } as React.CSSProperties : {}),
          ...style,
        }}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
