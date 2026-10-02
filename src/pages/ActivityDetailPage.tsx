import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import {
  PRIMARY_CLUSTER_ID,
  approveAndPublishActivity,
  getActivityById,
  getLocalities,
  updateActivity,
} from '../lib/db';
import {
  canApproveActivity,
  canDeleteActivity,
  canEditActivity,
  canPublishActivity,
} from '../lib/permissions';
import { Activity } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VisibilityBadge } from '../components/ui/VisibilityBadge';
import { ActivityFormModal } from '../components/activities/ActivityFormModal';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Edit,
  CheckCircle,
  Send,
  Archive,
  AlertTriangle,
  User,
} from 'lucide-react';

interface ActivityDetailPageProps {
  activityId: string;
  onNavigate: (path: string) => void;
}

export const ActivityDetailPage: React.FC<ActivityDetailPageProps> = ({
  activityId,
  onNavigate,
}) => {
  const { profile, role, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  let activity: Activity | null = null;
  let accessDenied = false;

  try {
    activity = getActivityById(activityId, profile, role);
  } catch (err: unknown) {
    accessDenied = true;
  }

  if (accessDenied || !activity) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Activity Not Accessible (403 / 404)</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          This activity either does not exist or your current role (<span className="font-semibold">{role}</span>) does not possess clearance to view it under PostgreSQL Row Level Security.
        </p>
        <button
          onClick={() => onNavigate('/activities')}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
        >
          Return to Activities List
        </button>
      </div>
    );
  }

  const locality = localities.find((l) => l.id === activity.locality_id);
  const canEdit = canEditActivity(profile, role, activity);
  const canApprove = canApproveActivity(role) && activity.status === 'pending_review';
  const canPublish = canPublishActivity(role) && activity.status !== 'published';
  const canArchive = canDeleteActivity(role) && activity.status !== 'archived';

  const handleAction = async (action: 'approve' | 'publish' | 'archive') => {
    if (!profile) return;
    setActionError(null);
    try {
      await approveAndPublishActivity(activity.id, profile, role, action);
      setActionSuccess(`Activity successfully ${action}d.`);
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : `Failed to ${action} activity.`);
    }
  };

  const handleSaveEdit = async (data: Partial<Activity>) => {
    if (!profile) return;
    await updateActivity(activity.id, data, profile, role);
    setRefreshKey((k) => k + 1);
  };

  const startDate = new Date(activity.start_time);
  const formattedDate = startDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedStartTime = startDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedEndTime = activity.end_time
    ? new Date(activity.end_time).toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
      <button
        onClick={() => onNavigate('/activities')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Activities</span>
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
              <span className="font-semibold text-slate-900">{activity.activity_type}</span>
              <span>·</span>
              <span>{locality?.name || 'Kimana Cluster'}</span>
            </div>

            <div className="flex items-center gap-2">
              <VisibilityBadge visibility={activity.visibility} />
              <span>·</span>
              <StatusBadge status={activity.status} />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {activity.title}
          </h1>
        </div>

        {/* Schedule & Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Date & Time</span>
            </div>
            <div className="text-slate-900 font-semibold">{formattedDate}</div>
            <div className="text-slate-600 font-mono tabular-nums">
              {formattedStartTime} {formattedEndTime ? `– ${formattedEndTime}` : ''}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Gathering Venue</span>
            </div>
            <div className="text-slate-900 font-semibold">
              {activity.location || 'Local Community Center'}
            </div>
            <div className="text-slate-500">
              Locality: {locality?.name || 'Cluster-wide coordination'}
            </div>
          </div>
        </div>

        {/* Description Body */}
        {activity.description && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              About this Gathering
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {activity.description}
            </p>
          </div>
        )}

        {/* Metadata info */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>Coordinated by {activity.creator_name || 'Cluster Coordinator'}</span>
          </div>
          <div>
            Listed on {new Date(activity.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Action Controls for Coordinators and Administrators */}
        {(canEdit || canApprove || canPublish || canArchive) && (
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
            {canEdit && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Activity</span>
              </button>
            )}

            {canApprove && (
              <button
                onClick={() => handleAction('approve')}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Approve Review</span>
              </button>
            )}

            {canPublish && (
              <button
                onClick={() => handleAction('publish')}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Publish to Calendar</span>
              </button>
            )}

            {canArchive && (
              <button
                onClick={() => handleAction('archive')}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Archive</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <ActivityFormModal
          activity={activity}
          localities={localities}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};
