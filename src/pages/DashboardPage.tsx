import React from 'react';
import { useAuth } from '../lib/auth-context';
import { RoleBadge } from '../components/ui/RoleBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { GlobalSearchBar } from '../components/search/GlobalSearchBar';
import {
  getActivities,
  getAnnouncements,
  getDocuments,
  getGroups,
} from '../lib/db';
import {
  Calendar,
  Users,
  FileText,
  MapPin,
  Bot,
  Shield,
  Clock,
  ArrowRight,
  Megaphone,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster, locality, isAtLeast, hasPermission } = useAuth();

  // Retrieve upcoming activities (permission-aware query, sorted by start_time ASC)
  const now = new Date().getTime();
  const allActivities = getActivities(profile, role);
  const upcomingActivities = allActivities
    .filter((a) => new Date(a.start_time).getTime() >= now)
    .slice(0, 3);

  // Retrieve recent announcements
  const recentAnnouncements = getAnnouncements(profile, role).slice(0, 2);

  // Retrieve recent documents
  const recentDocuments = getDocuments(profile, role).slice(0, 2);

  // Active groups count
  const activeGroups = getGroups(profile, role).length;

  const quickActions = [
    {
      title: 'Activities',
      desc: 'Browse schedule of devotional gatherings, classes, and study circles.',
      icon: Calendar,
      path: '/activities',
      count: allActivities.length,
      visible: hasPermission('activities.view'),
    },
    {
      title: 'Calendar',
      desc: 'Interactive month, week, and list view of cluster events.',
      icon: Clock,
      path: '/calendar',
      visible: hasPermission('activities.view'),
    },
    {
      title: 'Community Groups',
      desc: 'View active study circles, children’s classes, and youth groups.',
      icon: Users,
      path: '/groups',
      count: activeGroups,
      visible: hasPermission('groups.view'),
    },
    {
      title: 'Documents & Guidelines',
      desc: 'Access official educational materials, forms, and guides.',
      icon: FileText,
      path: '/documents',
      count: recentDocuments.length,
      visible: hasPermission('documents.view'),
    },
    {
      title: 'Announcements',
      desc: 'Official messages and community notices for Kimana Cluster.',
      icon: Megaphone,
      path: '/announcements',
      visible: hasPermission('announcements.view'),
    },
    {
      title: 'Kimana Assistant',
      desc: 'Inquire about approved cluster schedules and guidelines.',
      icon: Bot,
      path: '/assistant',
      visible: hasPermission('ai.use'),
    },
    {
      title: 'Admin Console',
      desc: 'Manage member access requests, user directory, and audit trail.',
      icon: Shield,
      path: '/admin',
      visible: isAtLeast('cluster_admin'),
      highlight: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Welcome & Status Header */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {cluster?.name || 'Kimana Cluster'}
              </span>
              <span className="text-emerald-300">·</span>
              <RoleBadge role={role} />
              <span className="text-emerald-300">·</span>
              <StatusBadge status={profile?.status || 'active'} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
              Welcome back, {profile?.full_name || 'Member'}
            </h1>
            <p className="text-xs text-slate-600">
              Locality: <span className="font-semibold text-emerald-950">{locality?.name || 'Kimana Central'}</span>
              {' · '}
              Region: <span className="font-semibold text-emerald-950">{cluster?.region || 'Kajiado South'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/calendar')}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-emerald-900/15 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition"
            >
              <Calendar className="h-4 w-4 text-emerald-700" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => onNavigate('/profile')}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 transition shadow-xs"
            >
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Global Search integrated in Dashboard */}
        <div className="mt-6 pt-6 border-t border-emerald-900/5">
          <label className="block text-xs font-semibold text-emerald-900 mb-1.5">
            Search Approved Information
          </label>
          <GlobalSearchBar onSelectResult={(path) => onNavigate(path)} />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-emerald-950">Cluster Core Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions
            .filter((a) => a.visible)
            .map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => onNavigate(action.path)}
                  className={`flex flex-col justify-between text-left rounded-2xl border p-5 transition hover:shadow-xs min-h-[140px] ${
                    action.highlight
                      ? 'border-emerald-700/30 bg-emerald-50/70 hover:border-emerald-600'
                      : 'border-emerald-900/10 bg-white hover:border-emerald-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        action.highlight ? 'bg-emerald-800 text-white' : 'bg-emerald-100/70 text-emerald-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {action.count !== undefined ? (
                      <span className="text-xs font-mono font-semibold text-emerald-700/70">
                        {action.count} listed
                      </span>
                    ) : (
                      <ArrowRight className="h-4 w-4 text-emerald-700/60" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">{action.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {action.desc}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Upcoming Activities & Announcements Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Activities */}
        <div className="lg:col-span-7 rounded-2xl border border-emerald-900/10 bg-white p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-700" />
              <span>Upcoming Activities</span>
            </h3>
            <button
              onClick={() => onNavigate('/activities')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
            >
              View all ({allActivities.length}) →
            </button>
          </div>

          {upcomingActivities.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No upcoming activities currently listed.</p>
          ) : (
            <div className="space-y-3">
              {upcomingActivities.map((act) => {
                const startDate = new Date(act.start_time);
                return (
                  <div
                    key={act.id}
                    onClick={() => onNavigate(`/activities/${act.id}`)}
                    className="rounded-xl border border-emerald-900/5 bg-emerald-50/30 p-3.5 space-y-1 cursor-pointer hover:bg-emerald-50/80 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">{act.title}</span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-600">
                        {startDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>{act.activity_type}</span>
                      <span>·</span>
                      <span>{act.location || 'Local Gathering'}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums text-emerald-900 font-semibold">
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recent Announcements */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-900/10 bg-white p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-600" />
              <span>Recent Announcements</span>
            </h3>
            <button
              onClick={() => onNavigate('/announcements')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
            >
              View notices →
            </button>
          </div>

          {recentAnnouncements.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No recent notices available.</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => onNavigate(`/announcements/${ann.id}`)}
                  className="rounded-xl border border-emerald-900/5 bg-emerald-50/30 p-3.5 space-y-1 cursor-pointer hover:bg-emerald-50/80 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950 line-clamp-1">{ann.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ann.published_at || ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
