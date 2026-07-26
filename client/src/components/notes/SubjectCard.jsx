import React from 'react';
import { Link } from 'react-router-dom';
import { SUBJECT_COLORS } from '../../utils/constants';

export default function SubjectCard({ subject }) {
  const colors = SUBJECT_COLORS[subject.color] || SUBJECT_COLORS.primary;
  const noteCount = Number(subject.note_count) || 0;

  return (
    <Link
      to={'/subjects/' + subject.id + '/notes'}
      className="group bg-white p-6 rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
    >
      <div
        className={
          'w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ' +
          colors.bg +
          ' ' +
          colors.text
        }
      >
        <span className="material-symbols-outlined text-[30px]" aria-hidden="true">
          {subject.icon}
        </span>
      </div>
      <div>
        <h3 className="font-headline-md text-headline-md text-text-primary group-hover:text-primary transition-colors">
          {subject.name}
        </h3>
        <p className="text-text-muted text-body-sm mt-1">
          {noteCount} {noteCount === 1 ? 'Note' : 'Notes'} Available
        </p>
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-subtle/70">
        <span className="font-label-sm text-label-sm text-primary font-bold">View Resources</span>
        <span
          className="material-symbols-outlined text-[18px] text-primary group-hover:translate-x-1 transition-transform"
          aria-hidden="true"
        >
          arrow_forward
        </span>
      </div>
    </Link>
  );
}
