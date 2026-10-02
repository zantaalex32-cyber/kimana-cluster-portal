import React from 'react';
import { ContentVisibility } from '../../types';
import { Globe, Users, Shield, Lock } from 'lucide-react';

interface VisibilityBadgeProps {
  visibility: ContentVisibility;
}

export const VisibilityBadge: React.FC<VisibilityBadgeProps> = ({ visibility }) => {
  const config: Record<ContentVisibility, { label: string; textClass: string; icon: typeof Globe }> = {
    public: {
      label: 'Public',
      textClass: 'text-slate-600',
      icon: Globe,
    },
    members: {
      label: 'Members',
      textClass: 'text-emerald-800 font-medium',
      icon: Users,
    },
    coordinators: {
      label: 'Coordinators',
      textClass: 'text-teal-800 font-semibold',
      icon: Shield,
    },
    admins: {
      label: 'Administrators Only',
      textClass: 'text-emerald-950 font-bold',
      icon: Lock,
    },
  };

  const item = config[visibility] || config.members;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${item.textClass}`} title={`Visibility: ${item.label}`}>
      <Icon className="h-3 w-3 shrink-0 opacity-70" />
      <span>{item.label}</span>
    </span>
  );
};
