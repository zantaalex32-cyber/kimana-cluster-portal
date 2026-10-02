import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { PermissionGate } from '../../components/ui/PermissionGate';
import {
  PRIMARY_CLUSTER_ID,
  getLocalities,
  getProfiles,
  getUserRole,
  updateUserStatus,
} from '../../lib/db';
import { Profile, RoleType, UserStatus } from '../../types';
import { RoleBadge } from '../../components/ui/RoleBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Search, ArrowLeft, AlertCircle, Check, Ban, CheckCircle } from 'lucide-react';

interface AdminUsersPageProps {
  onNavigate: (path: string) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigate }) => {
  const { profile: actor, role: actorRole, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, actor || undefined, actorRole);

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  let profiles: Profile[] = [];
  try {
    profiles = getProfiles(actor, actorRole);
  } catch (err) {
    console.error('Failed to load profiles', err);
  }

  const filteredUsers = profiles.filter((p) => {
    const userRole = getUserRole(p.id);
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || userRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (user: Profile, newStatus: UserStatus) => {
    if (!actor) return;
    setActionError(null);
    setActionMessage(null);

    try {
      await updateUserStatus({
        targetUserId: user.id,
        newStatus,
        actor,
        actorRole,
      });

      setActionMessage(`User ${user.full_name} status updated to ${newStatus}.`);
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Action failed.');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  return (
    <PermissionGate minRole="cluster_admin" showDenialMessage>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/admin')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Admin</span>
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              User Directory & Status
            </h1>
            <p className="text-xs text-slate-500">
              Manage member profiles, inspect locality assignments, and control account status under strict RLS.
            </p>
          </div>
        </div>

        {actionMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="coordinator">Coordinator</option>
              <option value="cluster_admin">Cluster Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="public">Public / Pending</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((user) => {
                  const userRole = getUserRole(user.id);
                  const loc = localities.find((l) => l.id === user.locality_id);
                  const isSelf = user.id === actor?.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div>{user.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RoleBadge role={userRole} />
                      </td>
                      <td className="py-3.5 px-4">{loc?.name || 'Unassigned'}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSelf ? (
                          <span className="text-slate-400 text-[11px] italic">Current Session</span>
                        ) : user.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(user, 'suspended')}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 transition"
                          >
                            <Ban className="h-3 w-3" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user, 'active')}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Reactivate</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};
