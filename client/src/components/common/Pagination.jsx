import React from 'react';

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, page + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={function () {
          onChange(page - 1);
        }}
        className="w-10 h-10 flex items-center justify-center border border-border-subtle rounded-lg text-text-secondary hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {start > 1 ? (
        <button
          type="button"
          onClick={function () {
            onChange(1);
          }}
          className="w-10 h-10 flex items-center justify-center border border-border-subtle rounded-lg text-text-secondary hover:bg-white font-label-md text-label-md"
        >
          1
        </button>
      ) : null}
      {start > 2 ? <span className="text-text-muted px-1">...</span> : null}

      {pages.map(function (p) {
        return (
          <button
            key={p}
            type="button"
            onClick={function () {
              onChange(p);
            }}
            aria-current={p === page ? 'page' : undefined}
            className={
              'w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-label-md transition-all ' +
              (p === page
                ? 'bg-primary text-white shadow-sm'
                : 'border border-border-subtle text-text-secondary hover:bg-white')
            }
          >
            {p}
          </button>
        );
      })}

      {end < totalPages - 1 ? <span className="text-text-muted px-1">...</span> : null}
      {end < totalPages ? (
        <button
          type="button"
          onClick={function () {
            onChange(totalPages);
          }}
          className="w-10 h-10 flex items-center justify-center border border-border-subtle rounded-lg text-text-secondary hover:bg-white font-label-md text-label-md"
        >
          {totalPages}
        </button>
      ) : null}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={function () {
          onChange(page + 1);
        }}
        className="w-10 h-10 flex items-center justify-center border border-border-subtle rounded-lg text-text-secondary hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </nav>
  );
}
