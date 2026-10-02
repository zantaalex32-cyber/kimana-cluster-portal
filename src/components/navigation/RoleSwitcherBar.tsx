import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { RoleType } from '../../types';
import { ShieldCheck, UserCheck } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { role, profile, switchDemoRole } = useAuth();

  const roles: Array<{ id: RoleType; label: string; desc: string }> = [
    { id: 'super_admin', label: 'Super Admin', desc: 'System level' },
    { id: 'cluster_admin', label: 'Cluster Admin', desc: 'Kimana admin' },
    { id: 'coordinator', label: 'Coordinator', desc: 'Activities' },
    { id: 'member', label: 'Member', desc: 'Routine' },
    { id: 'public', label: 'Public Guest', desc: 'Unauthenticated' },
  ];

  return (
    <div className="border-b border-emerald-900/10 bg-emerald-900/5 px-4 py-1.5 text-xs text-emerald-900 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          <span className="font-semibold text-emerald-950">RBAC Testing Mode:</span>
          <span className="text-emerald-800/80">
            {profile ? `${profile.full_name} (${role})` : 'Public Visitor (Unauthenticated)'}
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="mr-1 text-emerald-700/70">Switch Role:</span>
          {roles.map((r) => {
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => switchDemoRole(r.id)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-900 text-emerald-50 shadow-xs'
                    : 'bg-white/80 text-emerald-900/80 hover:bg-white hover:text-emerald-950 border border-emerald-900/10'
                }`}
                title={r.desc}
              >
                {isActive && <UserCheck className="h-3 w-3 text-emerald-300" />}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
