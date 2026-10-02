import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Group, Locality } from '../types';
import { PRIMARY_CLUSTER_ID, createGroup, getGroups, getLocalities } from '../lib/db';
import { canCreateGroup } from '../lib/permissions';
import { GroupCard } from '../components/groups/GroupCard';
import { GroupFormModal } from '../components/groups/GroupFormModal';
import { Users, Search, Plus, ArrowLeft } from 'lucide-react';

interface GroupsPageProps {
  onNavigate: (path: string) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load groups (strictly permission-aware database query)
  const groups = getGroups(profile, role, {
    localityId: selectedLocality,
    groupType: selectedType,
    search: searchTerm,
  });

  const handleCreateGroup = async (data: Partial<Group>) => {
    if (!profile) return;
    await createGroup(data as any, profile, role);
    setRefreshKey((k) => k + 1);
  };

  const groupTypes = [
    'all',
    'Study Circle',
    'Devotional Meeting',
    "Children's Class",
    'Junior Youth Group',
    'Other',
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
            Community Groups & Circles
          </h1>
          <p className="text-xs text-slate-600">
            Study circles, devotional groups, children’s classes, and junior youth groups in {cluster?.name || 'Kimana Cluster'}.
          </p>
        </div>

        {canCreateGroup(role) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Register Group</span>
          </button>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-700/60" />
            <input
              type="text"
              placeholder="Search groups by name, venue, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>

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
            <span className="text-slate-500 font-medium">Group Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Types</option>
              {groupTypes.filter((t) => t !== 'all').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-[11px] text-slate-400 font-mono tabular-nums">
            Showing {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          </span>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center space-y-2">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No community groups found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active groups match your current filters. Only groups within your clearance level are displayed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((grp) => {
            const loc = localities.find((l) => l.id === grp.locality_id);
            return (
              <GroupCard
                key={grp.id}
                group={grp}
                locality={loc}
                onClick={() => onNavigate(`/groups/${grp.id}`)}
              />
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <GroupFormModal
        localities={localities}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateGroup}
      />
    </div>
  );
};
