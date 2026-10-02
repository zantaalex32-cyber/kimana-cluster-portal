import React from 'react';
import { RoleType } from '../../types';

interface RoleBadgeProps {
  role: RoleType;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const roleConfig: Record<RoleType, { label: string; textClass: string; dotClass: string }> = {
    super_admin: {
      label: 'Super Admin',
      textClass: 'text-purple-900 font-semibold',
      dotClass: 'bg-purple-600',
    },
    cluster_admin: {
      label: 'Cluster Admin',
      textClass: 'text-emerald-950 font-bold',
      dotClass: 'bg-emerald-700',
    },
    coordinator: {
      label: 'Coordinator',
      textClass: 'text-teal-900 font-semibold',
      dotClass: 'bg-teal-600',
    },
    member: {
      label: 'Cluster Member',
      textClass: 'text-emerald-900 font-medium',
      dotClass: 'bg-emerald-500',
    },
    public: {
      label: 'Public Visitor',
      textClass: 'text-slate-500',
      dotClass: 'bg-slate-400',
    },
  };

  const config = roleConfig[role] || roleConfig.public;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
