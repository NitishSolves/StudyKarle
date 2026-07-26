import React from 'react';
import { formatDate } from '../../utils/formatDate';
import Badge from '../common/Badge';

export default function UsersTable({ users, currentUserId, onRoleChange, onDelete }) {
  return (
    <React.Fragment>
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-border-subtle">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-low text-text-secondary text-label-sm uppercase tracking-wider">
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Joined</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {users.map(function (u) {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-surface-low transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">{u.name}</td>
                  <td className="px-6 py-4 text-body-sm text-text-secondary">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-text-muted">{formatDate(u.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={function (e) {
                          onRoleChange(u, e.target.value);
                        }}
                        className="text-body-sm border border-border-subtle rounded-lg px-2 py-1.5 disabled:opacity-40"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={function () {
                          onDelete(u);
                        }}
                        className="text-text-muted hover:text-error transition-colors p-1 disabled:opacity-40"
                        aria-label={'Delete ' + u.name}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {users.map(function (u) {
          const isSelf = u.id === currentUserId;
          return (
            <div key={u.id} className="bg-white p-4 rounded-xl border border-border-subtle">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">{u.name}</p>
                  <p className="text-body-sm text-text-muted truncate">{u.email}</p>
                </div>
                <Badge variant={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <select
                  value={u.role}
                  disabled={isSelf}
                  onChange={function (e) {
                    onRoleChange(u, e.target.value);
                  }}
                  className="text-body-sm border border-border-subtle rounded-lg px-2 py-1.5 flex-1 disabled:opacity-40"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="button"
                  disabled={isSelf}
                  onClick={function () {
                    onDelete(u);
                  }}
                  className="text-text-muted hover:text-error transition-colors p-2 border border-border-subtle rounded-lg disabled:opacity-40"
                  aria-label={'Delete ' + u.name}
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}
