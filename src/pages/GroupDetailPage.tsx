import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import {
  PRIMARY_CLUSTER_ID,
  archiveGroup,
  getGroupById,
  getLocalities,
  updateGroup,
} from '../lib/db';
import { canEditGroup } from '../lib/permissions';
import { Group } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VisibilityBadge } from '../components/ui/VisibilityBadge';
import { GroupFormModal } from '../components/groups/GroupFormModal';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Edit,
  Archive,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface GroupDetailPageProps {
  groupId: string;
  onNavigate: (path: string) => void;
}

export const GroupDetailPage: React.FC<GroupDetailPageProps> = ({ groupId, onNavigate }) => {
  const { profile, role, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  let group: Group | null = null;
  let accessDenied = false;

  try {
    group = getGroupById(groupId, profile, role);
  } catch (err: unknown) {
    accessDenied = true;
  }

  if (accessDenied || !group) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Group Not Accessible (403 / 404)</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          This community group is either not found or your current role (<span className="font-semibold">{role}</span>) does not have authorization to view it under PostgreSQL Row Level Security.
        </p>
        <button
          onClick={() => onNavigate('/groups')}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
        >
          Return to Groups List
        </button>
      </div>
    );
  }

  const locality = localities.find((l) => l.id === group.locality_id);
  const canEdit = canEditGroup(profile, role, group);

  const handleArchive = async () => {
    if (!profile) return;
    try {
      await archiveGroup(group.id, profile, role);
      setActionSuccess('Group archived.');
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Archive failed.');
    }
  };

  const handleSaveEdit = async (data: Partial<Group>) => {
    if (!profile) return;
    await updateGroup(group.id, data, profile, role);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
      <button
        onClick={() => onNavigate('/groups')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Groups</span>
      </button>

      {actionSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{group.group_type}</span>
              <span>·</span>
              <span>{locality?.name || 'Kimana Cluster'}</span>
            </div>

            <div className="flex items-center gap-2">
              <VisibilityBadge visibility={group.visibility} />
              <span>·</span>
              <StatusBadge status={group.status} />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {group.name}
          </h1>
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Meeting Day & Time</span>
            </div>
            <div className="text-slate-900 font-semibold">{group.meeting_day || 'Weekly schedule'}</div>
            <div className="text-slate-600 font-mono tabular-nums">{group.meeting_time || 'Check with coordinator'}</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Venue</span>
            </div>
            <div className="text-slate-900 font-semibold">{group.location || 'Local Community Venue'}</div>
            <div className="text-slate-500">Locality: {locality?.name || 'Kimana'}</div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Group Overview & Curriculum
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {group.description}
            </p>
          </div>
        )}

        {/* Privacy Shield Notice */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3 text-xs text-slate-600">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-slate-800">Privacy Safeguards Enforced</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Participant registers, student names, and phone numbers are protected under cluster governance policies and PostgreSQL Row Level Security. Routine group listings display only meeting schedules and coordination centers.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>Facilitated by {group.creator_name || 'Cluster Coordinator'}</span>
          </div>
          <div>Registered on {new Date(group.created_at).toLocaleDateString()}</div>
        </div>

        {/* Action Controls */}
        {canEdit && (
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>

            {group.status === 'active' && (
              <button
                onClick={handleArchive}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Archive Group</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <GroupFormModal
          group={group}
          localities={localities}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};
