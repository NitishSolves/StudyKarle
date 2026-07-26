import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import NoteListItem from '../components/notes/NoteListItem';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Pagination from '../components/common/Pagination';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import useFetch from '../hooks/useFetch';
import { fetchSubject } from '../api/subjectsApi';
import { fetchNotesBySubject } from '../api/notesApi';

export default function NotesListPage() {
  const { subjectId } = useParams();
  const subjectState = useFetch(function () {
    return fetchSubject(subjectId);
  }, [subjectId]);

  const [page, setPage] = useState(1);
  const [notesData, setNotesData] = useState(null);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState(null);

  useEffect(
    function () {
      setNotesLoading(true);
      setNotesError(null);
      fetchNotesBySubject(subjectId, page)
        .then(setNotesData)
        .catch(function (err) {
          setNotesError(err.message);
        })
        .finally(function () {
          setNotesLoading(false);
        });
    },
    [subjectId, page]
  );

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { label: 'Browse', to: '/browse' },
          {
            label: subjectState.data ? subjectState.data.year_label : '...',
            to: subjectState.data ? '/browse/' + subjectState.data.year_id : undefined
          },
          {
            label: subjectState.data ? subjectState.data.semester_label : '...',
            to: subjectState.data ? '/browse/' + subjectState.data.year_id + '/' + subjectState.data.semester_id : undefined
          },
          { label: subjectState.data ? subjectState.data.name : '...' }
        ]}
      />

      {subjectState.loading ? (
        <Skeleton type="row" count={4} />
      ) : subjectState.error ? (
        <ErrorState message={subjectState.error} onRetry={subjectState.reload} />
      ) : (
        <React.Fragment>
          <div className="mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">{subjectState.data.name}</h2>
            <p className="text-body-md text-text-secondary">
              {notesData ? notesData.meta.total : 0} Notes Available
            </p>
          </div>

          {notesLoading ? (
            <Skeleton type="row" count={4} />
          ) : notesError ? (
            <ErrorState message={notesError} />
          ) : notesData.notes.length === 0 ? (
            <EmptyState icon="description" title="No notes here yet" description="This subject doesn't have any published notes yet." />
          ) : (
            <React.Fragment>
              <div className="space-y-4">
                {notesData.notes.map(function (note) {
                  return <NoteListItem key={note.id} note={note} />;
                })}
              </div>
              <Pagination page={page} totalPages={notesData.meta.totalPages} onChange={setPage} />
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </AppShell>
  );
}
