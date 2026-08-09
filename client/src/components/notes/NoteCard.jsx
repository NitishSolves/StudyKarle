import React from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/formatDate';

export default function NoteCard({ note }) {
  return (
    <Link
      to={'/notes/' + note.id}
      className="flex items-center justify-between gap-4 p-4 hover:bg-surface-low rounded-lg transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-error/10 text-error rounded flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined" aria-hidden="true">
            description
          </span>
        </div>
        <div className="min-w-0">
          <h5 className="font-label-md text-label-md text-text-primary group-hover:text-primary transition-colors truncate">
            {note.title}
          </h5>
          <p className="text-body-sm text-text-muted truncate">{note.subject_name}</p>
        </div>
      </div>
      <span className="text-body-sm text-text-muted italic shrink-0 hidden sm:block">
        {formatRelativeTime(note.created_at)}
      </span>
    </Link>
  );
}
