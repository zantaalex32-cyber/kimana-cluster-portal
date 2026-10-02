import React from 'react';
import { AccessRequestStatus, ActivityStatus, AnnouncementStatus, DocumentStatus, GroupStatus, UserStatus } from '../../types';

interface StatusBadgeProps {
  status:
    | UserStatus
    | AccessRequestStatus
    | ActivityStatus
    | GroupStatus
    | DocumentStatus
    | AnnouncementStatus
    | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<string, { label: string; textClass: string; dotClass: string }> = {
    published: {
      label: 'Published',
      textClass: 'text-emerald-700 font-medium',
      dotClass: 'bg-emerald-600',
    },
    active: {
      label: 'Active',
      textClass: 'text-emerald-700 font-medium',
      dotClass: 'bg-emerald-600',
    },
    approved: {
      label: 'Approved',
      textClass: 'text-blue-700 font-medium',
      dotClass: 'bg-blue-600',
    },
    pending: {
      label: 'Pending',
      textClass: 'text-amber-700 font-medium',
      dotClass: 'bg-amber-600',
    },
    pending_review: {
      label: 'Pending Review',
      textClass: 'text-amber-700 font-medium',
      dotClass: 'bg-amber-600',
    },
    draft: {
      label: 'Draft',
      textClass: 'text-slate-500 font-medium',
      dotClass: 'bg-slate-400',
    },
    archived: {
      label: 'Archived',
      textClass: 'text-slate-400',
      dotClass: 'bg-slate-300',
    },
    cancelled: {
      label: 'Cancelled',
      textClass: 'text-rose-700 font-medium',
      dotClass: 'bg-rose-600',
    },
    suspended: {
      label: 'Suspended',
      textClass: 'text-rose-700 font-medium',
      dotClass: 'bg-rose-600',
    },
    rejected: {
      label: 'Rejected',
      textClass: 'text-rose-700 font-medium',
      dotClass: 'bg-rose-600',
    },
    inactive: {
      label: 'Inactive',
      textClass: 'text-slate-400',
      dotClass: 'bg-slate-400',
    },
  };

  const config = statusConfig[status] || {
    label: status.replace('_', ' '),
    textClass: 'text-slate-600',
    dotClass: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};
