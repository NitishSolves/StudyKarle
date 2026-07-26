import React from 'react';

export default function StatCard({ icon, label, value, iconBg, iconColor, footer }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-border-subtle hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div
          className={'w-12 h-12 flex items-center justify-center rounded-lg ' + (iconBg || 'bg-primary/10')}
        >
          <span
            className={'material-symbols-outlined ' + (iconColor || 'text-primary')}
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>
      </div>
      <p className="text-body-sm text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <h3 className="font-headline-xl text-headline-xl text-text-primary">{value}</h3>
      {footer ? <p className="text-body-sm text-text-muted mt-2">{footer}</p> : null}
    </div>
  );
}
