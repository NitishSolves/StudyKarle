import React from 'react';
import AppShell from '../components/layout/AppShell';
import NoteListItem from '../components/notes/NoteListItem';
import SavedFileItem from '../components/notes/SavedFileItem';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { fetchSavedNotes } from '../api/savedApi';

export default function SavedNotesPage() {
  const { data, loading, error, reload } = useFetch(fetchSavedNotes, []);
  const notes = data ? data.notes || [] : [];
  const files = data ? data.files || [] : [];

  return (
    <AppShell>
      <div className="mb-stack-lg">
        <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">Saved</h2>
        <p className="text-body-md text-text-secondary">Everything you have saved for later.</p>
      </div>

      {loading ? (
        <Skeleton type="row" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : notes.length === 0 && files.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="Nothing saved yet"
          description="Save notes and files while browsing to find them quickly here."
          action={
            <Link to="/dashboard">
              <Button icon="dashboard">Browse Resources</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {notes.map(function (note) {
            return <NoteListItem key={'note-' + note.id} note={note} />;
          })}
          {files.map(function (file) {
            return <SavedFileItem key={'file-' + file.driveId} file={file} />;
          })}
        </div>
      )}
    </AppShell>
  );
}
