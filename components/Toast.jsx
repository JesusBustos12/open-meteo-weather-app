"use client";

import { useStore } from '../lib/store';

export default function Toast() {
  const { toastMessage, toastType } = useStore();

  if (!toastMessage) return null;

  return (
    <div className={`toast toast--${toastType}`} role="alert" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      background: toastType === 'error' ? 'var(--color-error, #ff4b4b)' : 'var(--color-exito, #00d26a)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <span className="material-symbols-outlined">
        {toastType === 'error' ? 'error' : 'check_circle'}
      </span>
      <span>{toastMessage}</span>
    </div>
  );
}
