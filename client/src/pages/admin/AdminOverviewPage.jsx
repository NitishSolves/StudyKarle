import React, { useState, useCallback } from 'react';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/admin/StatCard';
import NoteCard from '../../components/notes/NoteCard';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import { formatBytes } from '../../utils/formatBytes';
import { formatRelativeTime } from '../../utils/formatDate';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { fetchAdminStats, fetchDriveSyncStatus, triggerDriveSync } from '../../api/adminApi';

export default function AdminOverviewPage() {
  const { data: stats, loading, error, reload } = useFetch(fetchAdminStats, []);
  const toast = useToast();
  const [syncing, setSyncing] = useState(false);

  const syncState = useFetch(fetchDriveSyncStatus, []);

  const handleSync = useCallback(
    function () {
      setSyncing(true);
      triggerDriveSync()
        .then(function (result) {
          if (result.status === 'unconfigured') {
            toast.error('Library refresh is not configured on the server.');
          } else if (result.status === 'error') {
            toast.error('Refresh failed: ' + (result.error || 'unknown error'));
          } else if (result.status === 'already-running') {
            toast.info('A refresh is already running.');
          } else {
            toast.success(
              'Updated ' +
                (result.counts ? result.counts.folders : 0) +
                ' folders and ' +
                (result.counts ? result.counts.files : 0) +
                ' PDFs'
            );
          }
          syncState.reload();
          reload();
        })
        .catch(function (err) {
          toast.error(err.message || 'Failed to refresh library');
        })
        .finally(function () {
          setSyncing(false);
        });
    },
    [syncState, reload, toast]
  );

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

          {/* Library refresh status */}
          <div className="bg-white rounded-xl border border-border-subtle p-6 mb-stack-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-headline-md text-headline-md text-text-primary mb-1">
                  Content Library
                </h4>
                {syncState.loading ? (
                  <p className="text-body-sm text-text-muted">Loading library status…</p>
                ) : (
                  <p className="text-body-sm text-text-secondary">
                    {syncState.data && syncState.data.configured
                      ? 'Library ready. Last updated ' +
                        (syncState.data.last_synced_at
                          ? formatRelativeTime(syncState.data.last_synced_at)
                          : 'never') +
                        (syncState.data.folders_count != null
                          ? ' — ' + syncState.data.folders_count + ' folders, ' + syncState.data.files_count + ' PDFs'
                          : '')
                      : 'Library refresh is not configured on the server.'}
                    {syncState.data && syncState.data.status === 'syncing'
                      ? ' (updating right now…)'
                      : ''}
                    {syncState.data && syncState.data.status === 'error'
                      ? ' Last attempt failed.'
                      : ''}
                  </p>
                )}
                {syncState.data && syncState.data.configured && (
                  <p className="text-body-sm text-text-muted mt-1 truncate">
                    Folder id: {syncState.data.rootFolderId}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  icon="refresh"
                  loading={syncing}
                  onClick={handleSync}
                  disabled={syncing || (syncState.data && syncState.data.status === 'syncing')}
                >
                  Refresh Now
                </Button>
              </div>
            </div>
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
