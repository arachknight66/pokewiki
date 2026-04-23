/**
 * UI Components - Button — Pokémon anime-styled with cel-shaded borders
 */

'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles = {
  primary: 'anime-btn anime-btn-primary',
  secondary: 'anime-btn anime-btn-secondary',
  danger: [
    'anime-btn font-extrabold',
    'bg-gradient-to-r from-red-500 to-rose-600 text-white',
    'border-2 border-red-700',
    'shadow-lg shadow-red-500/20 hover:shadow-red-500/40',
  ].join(' '),
  ghost: [
    'anime-btn font-extrabold',
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    'border-2 border-transparent hover:border-[var(--border-color)]',
    'hover:bg-[var(--bg-card)]',
  ].join(' '),
  outline: [
    'anime-btn font-extrabold',
    'bg-transparent text-[var(--text-primary)]',
    'border-2 border-[var(--border-color-bold)]',
    'hover:bg-[var(--bg-card)] hover:border-[var(--text-primary)]',
  ].join(' '),
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          rounded-xl transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spinner" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
