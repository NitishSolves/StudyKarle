import React from 'react';
import AppShell from '../components/layout/AppShell';
import YearCard from '../components/notes/YearCard';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import useFetch from '../hooks/useFetch';
import { fetchYears } from '../api/subjectsApi';

export default function BrowseYearsPage() {
  const { data: years, loading, error, reload } = useFetch(fetchYears, []);

  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Browse' }]} />
      {/* <div className="mb-stack-lg">
        <h2 className="font-headline-lg text-headline-lg text-text-primary mb-1">Browse by Year</h2>
        <p className="text-body-md text-text-secondary">Select a year to explore semesters and subjects.</p>
      </div> */}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <Skeleton type="card" count={4} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {years.map(function (year, index) {
            return <YearCard key={year.id} year={year} index={index} />;
          })}
        </div>
      )}
    </AppShell>
  );
}
