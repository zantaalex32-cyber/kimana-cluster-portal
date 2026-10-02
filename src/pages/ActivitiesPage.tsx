import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Activity, Locality } from '../types';
import {
  PRIMARY_CLUSTER_ID,
  createActivity,
  getActivities,
  getLocalities,
  updateActivity,
} from '../lib/db';
import { canCreateActivity } from '../lib/permissions';
import { ActivityCard } from '../components/activities/ActivityCard';
import { ActivityFormModal } from '../components/activities/ActivityFormModal';
import { Search, Plus, Calendar, Filter, ArrowLeft } from 'lucide-react';

interface ActivitiesPageProps {
  onNavigate: (path: string) => void;
}

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load activities (strictly permission-aware database query)
  const activities = getActivities(profile, role, {
    localityId: selectedLocality,
    activityType: selectedType,
    search: searchTerm,
  });

  const now = new Date().getTime();
  const filteredActivities = activities.filter((act) => {
    const actTime = new Date(act.start_time).getTime();
    if (timeFilter === 'upcoming') return actTime >= now;
    if (timeFilter === 'past') return actTime < now;
    return true;
  });

  const handleCreateActivity = async (data: Partial<Activity>) => {
    if (!profile) return;
    await createActivity(
      data as any,
      profile,
      role
    );
    setRefreshKey((k) => k + 1);
  };

  const activityTypes = [
    'all',
    'Devotional Meeting',
    'Study Circle',
    "Children's Class",
    'Junior Youth Group',
    'Consultation',
    'Coordinators Meeting',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 mb-2 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
            Cluster Activities & Gatherings
          </h1>
          <p className="text-xs text-slate-600">
            Approved devotional gatherings, study circles, and educational programs across {cluster?.name || 'Kimana Cluster'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/calendar')}
            className="flex min-h-[40px] items-center gap-2 rounded-xl border border-emerald-900/15 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition"
          >
            <Calendar className="h-4 w-4 text-emerald-700" />
            <span>Calendar View</span>
          </button>

          {canCreateActivity(role) && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Activity</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-700/60" />
            <input
              type="text"
              placeholder="Search activities by title, venue, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-emerald-900/5 rounded-lg shrink-0 border border-emerald-900/10">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeFilter === 'upcoming'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeFilter === 'past'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeFilter === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-900 hover:text-emerald-950'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-900/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-950 font-semibold">Locality:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-700"
            >
              <option value="all">All Localities</option>
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Activity Types</option>
              {activityTypes.filter((t) => t !== 'all').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-[11px] text-slate-400 font-mono tabular-nums">
            Showing {filteredActivities.length} authorized {filteredActivities.length === 1 ? 'activity' : 'activities'}
          </span>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center space-y-2">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No activities found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No activities match your current search and filters. Only approved activities within your clearance level are displayed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((act) => {
            const loc = localities.find((l) => l.id === act.locality_id);
            return (
              <ActivityCard
                key={act.id}
                activity={act}
                locality={loc}
                onClick={() => onNavigate(`/activities/${act.id}`)}
              />
            );
          })}
        </div>
      )}

      {/* Create Activity Modal */}
      <ActivityFormModal
        localities={localities}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateActivity}
      />
    </div>
  );
};
