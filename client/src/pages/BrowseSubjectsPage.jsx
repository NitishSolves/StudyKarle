import React from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import SubjectCard from '../components/notes/SubjectCard';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import useFetch from '../hooks/useFetch';
import { fetchSubjects } from '../api/subjectsApi';

export default function BrowseSubjectsPage() {
  const { yearId, semesterId } = useParams();
  const { data, loading, error, reload } = useFetch(function () {
    return fetchSubjects(semesterId);
  }, [semesterId]);

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { label: 'Browse', to: '/browse' },
          { label: data ? data.semester.year_label : '...', to: '/browse/' + yearId },
          { label: data ? data.semester.label : '...' }
        ]}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          <Skeleton type="card" count={6} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <React.Fragment>
          <div className="mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">
              {data.semester.year_label} — {data.semester.label}
            </h2>
            <p className="text-body-md text-text-secondary">Select a subject to explore curated notes.</p>
          </div>

          {data.subjects.length === 0 ? (
            <EmptyState
              icon="category"
              title="No subjects yet"
              description="Subjects for this semester haven't been added yet. Check back soon."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {data.subjects.map(function (subject) {
                return <SubjectCard key={subject.id} subject={subject} />;
              })}
            </div>
          )}
        </React.Fragment>
      )}
    </AppShell>
  );
}
