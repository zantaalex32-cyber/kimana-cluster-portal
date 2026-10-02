import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { PermissionGate } from '../../components/ui/PermissionGate';
import { getStoredAuditLogs } from '../../lib/audit';
import { ArrowLeft, Clock, ShieldCheck } from 'lucide-react';

interface AdminAuditLogPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAuditLogPage: React.FC<AdminAuditLogPageProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const logs = getStoredAuditLogs();

  return (
    <PermissionGate minRole="cluster_admin" showDenialMessage>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
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
              Audit Trail & Compliance
            </h1>
            <p className="text-xs text-slate-500">
              Protected log of administrative events, access approvals, role assignments, and security adjustments.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>RLS Protected (Admins only)</span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition font-mono">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span className="font-mono text-[11px] text-blue-700">{log.action}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-sans">
                      <div>{log.user_name || 'System'}</div>
                      {log.user_role && (
                        <div className="text-[10px] text-slate-400 capitalize">{log.user_role}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="capitalize">{log.entity_type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};
