import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-xl border border-border-subtle animate-pulse">
      <div className="w-12 h-12 bg-surface-high rounded-lg mb-4" />
      <div className="h-5 w-3/4 bg-surface-high rounded mb-2" />
      <div className="h-4 w-1/2 bg-surface-low rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-white p-4 rounded-xl border border-border-subtle animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 bg-surface-high rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-surface-high rounded" />
        <div className="h-3 w-1/3 bg-surface-low rounded" />
      </div>
    </div>
  );
}

export default function Skeleton({ type, count }) {
  const items = Array.from({ length: count || 3 });
  return (
    <div className="space-y-4">
      {items.map(function (_, i) {
        return type === 'card' ? <SkeletonCard key={i} /> : <SkeletonRow key={i} />;
      })}
    </div>
  );
}
