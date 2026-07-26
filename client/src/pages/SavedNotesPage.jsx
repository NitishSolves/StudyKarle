import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import NoteListItem from '../components/notes/NoteListItem';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { fetchSavedNotes } from '../api/savedApi';

export default function SavedNotesPage() {
  const { data: notes, loading, error, reload } = useFetch(fetchSavedNotes, []);

  return (
    <AppShell>
      <div className="mb-stack-lg">
        <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">Saved Notes</h2>
        <p className="text-body-md text-text-secondary">Notes you have bookmarked for later.</p>
      </div>

      {loading ? (
        <Skeleton type="row" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon="bookmark_border"
          title="No saved notes yet"
          description="Save notes while browsing to find them quickly here."
          action={
            <Link to="/dashboard">
              <Button icon="explore">Browse Notes</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {notes.map(function (note) {
            return <NoteListItem key={note.saved_id} note={note} />;
          })}
        </div>
      )}
    </AppShell>
  );
}
