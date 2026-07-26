import React, { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children, footer }) {
  const dialogRef = useRef(null);

  useEffect(
    function () {
      function handleKeyDown(e) {
        if (e.key === 'Escape') {
          onClose();
        }
      }
      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        dialogRef.current && dialogRef.current.focus();
      }
      return function () {
        document.removeEventListener('keydown', handleKeyDown);
      };
    },
    [open, onClose]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-text-primary/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 id="modal-title" className="font-headline-md text-headline-md text-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer ? <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
