/**
 * UI Components - Toast Notification
 */

'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div 
      className="fixed bottom-5 right-5 z-50"
      style={{ minWidth: '300px', maxWidth: '400px' }}
    >
      <div 
        className={isSuccess ? 'auth-success' : 'auth-error'}
        style={{
          boxShadow: '4px 4px 0px var(--text-primary)',
          border: '3px solid var(--text-primary)',
          borderRadius: '0.75rem',
          backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        }}
      >
        <span className={isSuccess ? '' : 'error-icon'} style={{ fontSize: '1.25rem' }}>
          {isSuccess ? '✨' : '⚠️'}
        </span>
        <div className="flex-1 font-bold text-sm">
          {message}
        </div>
        <button 
          onClick={onClose}
          className="ml-2 hover:scale-110 active:scale-95 opacity-60 hover:opacity-100 transition-all font-black text-sm"
          style={{ color: 'inherit' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
