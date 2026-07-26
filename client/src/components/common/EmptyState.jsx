import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-text-muted text-[32px]" aria-hidden="true">
          {icon || 'inbox'}
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-text-primary mb-1">{title}</h3>
      {description ? (
        <p className="text-body-sm text-text-muted max-w-sm mb-6">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
