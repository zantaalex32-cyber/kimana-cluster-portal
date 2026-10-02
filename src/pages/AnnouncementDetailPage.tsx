import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { getAnnouncementById, publishAnnouncement } from '../lib/db';
import { canPublishAnnouncement } from '../lib/permissions';
import { Announcement } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VisibilityBadge } from '../components/ui/VisibilityBadge';
import {
  Calendar,
  ArrowLeft,
  Send,
  AlertTriangle,
  User,
  CheckCircle,
} from 'lucide-react';

interface AnnouncementDetailPageProps {
  announcementId: string;
  onNavigate: (path: string) => void;
}

export const AnnouncementDetailPage: React.FC<AnnouncementDetailPageProps> = ({
  announcementId,
  onNavigate,
}) => {
  const { profile, role } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  let announcement: Announcement | null = null;
  let accessDenied = false;

  try {
    announcement = getAnnouncementById(announcementId, profile, role);
  } catch (err: unknown) {
    accessDenied = true;
  }

  if (accessDenied || !announcement) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Announcement Not Accessible (403 / 404)</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          This announcement is either draft/internal or your current role (<span className="font-semibold">{role}</span>) does not have clearance to view it under PostgreSQL Row Level Security.
        </p>
        <button
          onClick={() => onNavigate('/announcements')}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
        >
          Return to Announcements
        </button>
      </div>
    );
  }

  const canPublish = canPublishAnnouncement(role) && announcement.status !== 'published';

  const handlePublish = async () => {
    if (!profile) return;
    try {
      await publishAnnouncement(announcement.id, profile, role);
      setActionSuccess('Announcement published.');
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Publishing failed.');
    }
  };

  const displayDate = announcement.published_at || announcement.created_at;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
      <button
        onClick={() => onNavigate('/announcements')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Announcements</span>
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

      {/* Main Announcement Card */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{new Date(displayDate).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-2">
              <VisibilityBadge visibility={announcement.visibility} />
              <span>·</span>
              <StatusBadge status={announcement.status} />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {announcement.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
            <User className="h-3.5 w-3.5" />
            <span>Authorized by {announcement.creator_name || 'Cluster Administrator'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {announcement.content}
        </div>

        {/* Admin Actions */}
        {canPublish && (
          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button
              onClick={handlePublish}
              className="flex min-h-[40px] items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publish Cluster-Wide</span>
            </button>
          </div>
        )}
      </article>
    </div>
  );
};
