import React from 'react';
import { Group, Locality } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { VisibilityBadge } from '../ui/VisibilityBadge';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  locality?: Locality;
  onClick: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, locality, onClick }) => {
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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{group.group_type}</span>
            <span aria-hidden="true">·</span>
            <span>{locality?.name || 'Kimana Cluster'}</span>
          </div>
          <VisibilityBadge visibility={group.visibility} />
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
          {group.name}
        </h3>

        {group.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {group.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          {group.meeting_day && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{group.meeting_day}</span>
            </div>
          )}
          {group.meeting_time && (
            <div className="flex items-center gap-1 font-mono tabular-nums text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{group.meeting_time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-500 max-w-[180px] truncate" title={group.location || ''}>
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{group.location || 'Local Gathering'}</span>
        </div>
      </div>
    </div>
  );
};
