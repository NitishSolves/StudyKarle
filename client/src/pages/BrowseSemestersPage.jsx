import React from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import useFetch from '../hooks/useFetch';
import { fetchSemesters } from '../api/subjectsApi';

export default function BrowseSemestersPage() {
  const { yearId } = useParams();
  const { data, loading, error, reload } = useFetch(function () {
    return fetchSemesters(yearId);
  }, [yearId]);

  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Browse', to: '/browse' }, { label: data ? data.year.label : '...' }]} />

      {loading ? (
        <Skeleton type="card" count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <React.Fragment>
          <div className="mb-stack-lg">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">{data.year.label}</h2>
            <p className="text-body-md text-text-secondary">Select a semester to view subjects.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {data.semesters.map(function (semester) {
              return (
                <Link
                  key={semester.id}
                  to={'/browse/' + yearId + '/' + semester.id}
                  className="bg-white p-6 rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-all group flex flex-col gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      calendar_month
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-text-primary group-hover:text-primary transition-colors">
                    {semester.label}
                  </h3>
                  <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
                    View Subjects
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </AppShell>
  );
}
