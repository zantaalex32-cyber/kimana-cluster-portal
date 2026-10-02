import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { getAccessRequests, getProfiles, getLocalities, PRIMARY_CLUSTER_ID } from '../../lib/db';
import { getStoredAuditLogs } from '../../lib/audit';
import { Users, UserPlus, MapPin, ShieldAlert, ArrowRight, Shield } from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();

  // Factual administrative metrics
  let totalUsers = 0;
  let pendingRequests = 0;
  let localitiesCount = 0;
  let auditLogsCount = 0;

  try {
    const users = getProfiles(profile, role);
    totalUsers = users.length;
    
    const requests = getAccessRequests(profile, role);
    pendingRequests = requests.filter((r) => r.status === 'pending').length;

    const locs = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);
    localitiesCount = locs.length;

    const logs = getStoredAuditLogs();
    auditLogsCount = logs.length;
  } catch (e) {
    console.error('Admin metrics error', e);
  }

  return (
    <PermissionGate minRole="cluster_admin" showDenialMessage>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Administrative Console · {cluster?.name || 'Kimana Cluster'}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Cluster Administration
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Authorized oversight for member registrations, role assignments, localities, and audit tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/admin/access-requests')}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Review Requests ({pendingRequests})</span>
            </button>
          </div>
        </div>

        {/* Factual Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Members</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalUsers}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Within current cluster</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">Pending Requests</span>
              <UserPlus className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 text-2xl font-bold text-amber-900 font-mono tabular-nums">
              {pendingRequests}
            </div>
            <p className="mt-1 text-[11px] text-amber-700 font-medium">Awaiting administrator review</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Localities</span>
              <MapPin className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {localitiesCount}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Kimana coordinated zones</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Audit Log Events</span>
              <ShieldAlert className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {auditLogsCount}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Protected security log records</p>
          </div>
        </div>

        {/* Quick Admin Navigation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('/admin/access-requests')}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600">Access Control</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">Access Requests</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Review new applicant submissions, assign locality affiliations, verify reasons, and grant approved roles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-700">
              {pendingRequests} pending verification →
            </div>
          </button>

          <button
            onClick={() => onNavigate('/admin/users')}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600">User Management</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">Directory & Roles</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Inspect registered member profiles, filter by locality or role, and suspend/reactivate access with audit logging.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-700">
              Manage member profiles →
            </div>
          </button>

          <button
            onClick={() => onNavigate('/admin/audit')}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-600">Compliance & Security</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">Audit Trail</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Immutable record of administrative decisions, role adjustments, approvals, and security updates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-700">
              Inspect {auditLogsCount} audit events →
            </div>
          </button>
        </div>
      </div>
    </PermissionGate>
  );
};
