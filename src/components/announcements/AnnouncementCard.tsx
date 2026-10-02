import React, { useState } from 'react';
import { Announcement } from '../../types';
import { useAuth } from '../../lib/auth-context';
import { StatusBadge } from '../ui/StatusBadge';
import { VisibilityBadge } from '../ui/VisibilityBadge';
import { canPublishAnnouncement } from '../../lib/permissions';
import { publishAnnouncement } from '../../lib/db';
import { Megaphone, Calendar, Send, ArrowRight } from 'lucide-react';

interface AnnouncementCardProps {
  announcement: Announcement;
  onClick: () => void;
  onRefresh: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onClick,
  onRefresh,
}) => {
  const { profile, role } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);

  const canPublish = canPublishAnnouncement(role) && announcement.status !== 'published';

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) return;
    setIsPublishing(true);
    try {
      await publishAnnouncement(announcement.id, profile, role);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Publishing failed.');
    } finally {
      setIsPublishing(false);
    }
  };

  const displayDate = announcement.published_at || announcement.created_at;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-slate-900 cursor-pointer"
    >
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{new Date(displayDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <VisibilityBadge visibility={announcement.visibility} />
            {announcement.status !== 'published' && (
              <>
                <span aria-hidden="true">·</span>
                <StatusBadge status={announcement.status} />
              </>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
          {announcement.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {announcement.content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-blue-600 font-medium group-hover:underline inline-flex items-center gap-1">
          <span>Read full notice</span>
          <ArrowRight className="h-3 w-3" />
        </span>

        {canPublish && (
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Send className="h-3 w-3" />
            <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
