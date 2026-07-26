import React from 'react';
import { Link } from 'react-router-dom';

const ICONS = ['filter_1', 'filter_2', 'filter_3', 'filter_4'];
const COLORS = [
  { bg: 'bg-status-success/10', text: 'text-status-success' },
  { bg: 'bg-primary/10', text: 'text-primary' },
  { bg: 'bg-secondary/10', text: 'text-secondary' },
  { bg: 'bg-tertiary/10', text: 'text-tertiary' }
];

export default function YearCard({ year, index }) {
  const icon = ICONS[index % ICONS.length];
  const color = COLORS[index % COLORS.length];

  return (
    <Link
      to={'/browse/' + year.id}
      className="bg-white p-6 rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-all group"
    >
      <div
        className={
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ' +
          color.bg +
          ' ' +
          color.text
        }
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-text-primary mb-1">{year.label}</h3>
      <p className="text-body-sm text-text-secondary mb-6">Browse subjects and notes for {year.label}.</p>
      <div className="flex items-center gap-2 text-primary font-label-md text-label-md group-hover:gap-3 transition-all">
        Explore Notes
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          arrow_forward
        </span>
      </div>
    </Link>
  );
}
