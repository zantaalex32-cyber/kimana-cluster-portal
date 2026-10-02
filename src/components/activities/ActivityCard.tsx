import React from 'react';
import { Activity, Locality } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { VisibilityBadge } from '../ui/VisibilityBadge';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  locality?: Locality;
  onClick: () => void;
  showStatus?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  locality,
  onClick,
  showStatus = true,
}) => {
  const startDate = new Date(activity.start_time);
  const formattedDate = startDate.toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-slate-900 cursor-pointer"
    >
      <div className="space-y-2.5">
        {/* Unboxed Metadata Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{activity.activity_type}</span>
            <span aria-hidden="true">·</span>
            <span>{locality?.name || 'Cluster-wide'}</span>
          </div>

          <div className="flex items-center gap-2">
            <VisibilityBadge visibility={activity.visibility} />
            {showStatus && activity.status !== 'published' && (
              <>
                <span aria-hidden="true">·</span>
                <StatusBadge status={activity.status} />
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
          {activity.title}
        </h3>

        {/* Description snippet */}
        {activity.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        )}
      </div>

      {/* Date, Time & Location Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-700 font-medium">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 font-mono tabular-nums text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 max-w-[200px] truncate" title={activity.location || ''}>
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{activity.location || 'Local Gathering'}</span>
        </div>
      </div>
    </div>
  );
};
