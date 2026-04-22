/**
 * UI Components - Card
 */

'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800
          shadow-sm transition-all duration-200
          ${hoverable ? 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer' : ''}
          p-6
          ${className}
        `}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
