import React from 'react';
import Button from './Button';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-error text-[32px]" aria-hidden="true">
          error
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-text-primary mb-1">Something went wrong</h3>
      <p className="text-body-sm text-text-muted max-w-sm mb-6">
        {message || 'We could not load this content. Please try again.'}
      </p>
      {onRetry ? (
        <Button variant="secondary" icon="refresh" onClick={onRetry}>
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
