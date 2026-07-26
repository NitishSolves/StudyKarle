import React from 'react';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/admin/StatCard';
import NoteCard from '../../components/notes/NoteCard';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import { formatBytes } from '../../utils/formatBytes';
import { formatRelativeTime } from '../../utils/formatDate';
import useFetch from '../../hooks/useFetch';
import { fetchAdminStats } from '../../api/adminApi';

export default function AdminOverviewPage() {
  const { data: stats, loading, error, reload } = useFetch(fetchAdminStats, []);

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-stack-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary">Admin Dashboard</h2>
          <p className="text-body-md text-text-secondary">Overview of StudyKarle resources and engagement.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <Skeleton type="card" count={4} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <React.Fragment>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
            <StatCard icon="description" label="Total Notes" value={stats.totalNotes} iconBg="bg-primary/10" iconColor="text-primary" />
            <StatCard icon="group" label="Total Users" value={stats.totalUsers} iconBg="bg-secondary/10" iconColor="text-secondary" />
            <StatCard icon="visibility" label="Total Views" value={stats.totalViews} iconBg="bg-tertiary/10" iconColor="text-tertiary" />
            <StatCard icon="storage" label="Storage Used" value={formatBytes(stats.totalSizeBytes)} iconBg="bg-error-container" iconColor="text-error" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2 bg-white rounded-xl border border-border-subtle overflow-hidden">
              <div className="px-6 py-5 border-b border-border-subtle">
                <h4 className="font-headline-md text-headline-md text-text-primary">Recent Uploads</h4>
              </div>
              {stats.recentUploads.length === 0 ? (
                <p className="p-6 text-body-sm text-text-muted">No notes uploaded yet.</p>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {stats.recentUploads.map(function (note) {
                    return <NoteCard key={note.id} note={note} />;
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-border-subtle p-6">
              <h4 className="font-headline-md text-headline-md text-text-primary mb-4">Recent Activity</h4>
              {stats.recentActivity.length === 0 ? (
                <p className="text-body-sm text-text-muted">No activity recorded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.recentActivity.map(function (activity) {
                    return (
                      <li key={activity.id} className="text-body-sm text-text-secondary border-b border-border-subtle last:border-0 pb-3 last:pb-0">
                        <span className="font-medium text-text-primary">{activity.admin_name || 'Admin'}</span>{' '}
                        {activity.action.replace('.', ' ')}
                        <span className="block text-text-muted text-[12px] mt-0.5">
                          {formatRelativeTime(activity.created_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </React.Fragment>
      )}
    </AppShell>
  );
}
