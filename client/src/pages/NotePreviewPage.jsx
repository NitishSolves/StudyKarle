import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Spinner from '../components/common/Spinner';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import { formatBytes } from '../utils/formatBytes';
import { formatDate } from '../utils/formatDate';
import useFetch from '../hooks/useFetch';
import { fetchNote, getDownloadUrl } from '../api/notesApi';
import { saveNote, unsaveNote } from '../api/savedApi';
import { useToast } from '../context/ToastContext';

// Loaded lazily because it pulls in pdf.js, which should only be downloaded
// by users who actually open a note preview, not on every page of the app.
const PdfPreview = lazy(function () {
  return import('../components/notes/PdfPreview');
});

export default function NotePreviewPage() {
  const { noteId } = useParams();
  const toast = useToast();
  const { data: note, loading, error, reload } = useFetch(function () {
    return fetchNote(noteId);
  }, [noteId]);

  const [saved, setSaved] = useState(false);
  const [savingBusy, setSavingBusy] = useState(false);

  useEffect(function () {
    setSaved(false);
  }, [noteId]);

  function handleToggleSave() {
    setSavingBusy(true);
    const action = saved ? unsaveNote(noteId) : saveNote(noteId);
    action
      .then(function () {
        setSaved(!saved);
        toast.success(saved ? 'Removed from saved notes' : 'Saved for later');
      })
      .catch(function (err) {
        toast.error(err.message);
      })
      .finally(function () {
        setSavingBusy(false);
      });
  }

  function handleShare() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: note ? note.title : 'StudyKarle Note', url: shareUrl }).catch(function () {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  }

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { label: 'Browse', to: '/browse' },
          {
            label: note ? note.year_label : '...',
            to: note ? '/browse/' + note.year_id : undefined
          },
          {
            label: note ? note.semester_label : '...',
            to: note ? '/browse/' + note.year_id + '/' + note.semester_id : undefined
          },
          {
            label: note ? note.subject_name : '...',
            to: note ? '/subjects/' + note.subject_id + '/notes' : undefined
          },
          { label: note ? note.title : '...' }
        ]}
      />

      {loading ? (
        <Skeleton type="row" count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <React.Fragment>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-text-primary">{note.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="primary">PDF</Badge>
                <Badge variant="success">Secure Preview</Badge>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="secondary" icon="share" onClick={handleShare} className="flex-1 md:flex-none">
                Share
              </Button>
              <Button
                variant="secondary"
                icon={saved ? 'bookmark' : 'bookmark_border'}
                onClick={handleToggleSave}
                loading={savingBusy}
                className="flex-1 md:flex-none"
              >
                {saved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-8">
              <Suspense
                fallback={
                  <div className="relative bg-surface-high rounded-xl overflow-hidden border border-border-subtle h-[70vh] lg:h-[750px] flex items-center justify-center">
                    <Spinner size="lg" label="Loading preview..." />
                  </div>
                }
              >
                <PdfPreview noteId={note.id} title={note.title} />
              </Suspense>
            </div>

            <div className="xl:col-span-4 space-y-gutter">
              <div className="bg-white rounded-xl border border-border-subtle p-stack-md">
                <h3 className="text-label-md text-text-muted uppercase tracking-wider mb-6">File Details</h3>
                <dl className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                    <dt className="text-body-sm text-text-secondary">Subject</dt>
                    <dd className="font-label-md text-label-md text-text-primary">{note.subject_name}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                    <dt className="text-body-sm text-text-secondary">Semester</dt>
                    <dd className="font-label-md text-label-md text-text-primary">{note.semester_label}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                    <dt className="text-body-sm text-text-secondary">Uploaded on</dt>
                    <dd className="font-label-md text-label-md text-text-primary">{formatDate(note.created_at)}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <dt className="text-body-sm text-text-secondary">Size</dt>
                    <dd className="font-label-md text-label-md text-text-primary">{formatBytes(note.size_bytes)}</dd>
                  </div>
                </dl>
                <a href={getDownloadUrl(note.id)} className="block mt-6">
                  <Button icon="download" fullWidth>
                    Download Notes
                  </Button>
                </a>
              </div>

              {note.description ? (
                <div className="bg-white rounded-xl border border-border-subtle p-stack-md">
                  <h3 className="text-label-md text-text-muted uppercase tracking-wider mb-3">Description</h3>
                  <p className="text-body-sm text-text-secondary leading-relaxed">{note.description}</p>
                </div>
              ) : null}
            </div>
          </div>
        </React.Fragment>
      )}
    </AppShell>
  );
}
