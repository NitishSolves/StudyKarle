import React from 'react';

const VARIANTS = {
  success: 'bg-status-success/10 text-status-success',
  danger: 'bg-status-danger/10 text-status-danger',
  neutral: 'bg-surface-high text-text-secondary',
  primary: 'bg-primary/10 text-primary'
};

export default function Badge({ children, variant }) {
  return (
    <span
      className={
        'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ' +
        (VARIANTS[variant] || VARIANTS.neutral)
      }
    >
      {children}
    </span>
  );
}
