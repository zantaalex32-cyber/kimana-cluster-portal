import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Announcement } from '../types';
import { createAnnouncement, getAnnouncements } from '../lib/db';
import { canCreateAnnouncement } from '../lib/permissions';
import { AnnouncementCard } from '../components/announcements/AnnouncementCard';
import { AnnouncementFormModal } from '../components/announcements/AnnouncementFormModal';
import { Megaphone, Search, Plus, ArrowLeft } from 'lucide-react';

interface AnnouncementsPageProps {
  onNavigate: (path: string) => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load announcements (strictly permission-aware database query)
  const announcements = getAnnouncements(profile, role, {
    search: searchTerm,
  });

  const handleCreateAnnouncement = async (data: {
    title: string;
    content: string;
    visibility: 'public' | 'members' | 'coordinators' | 'admins';
    status: 'draft' | 'pending_review' | 'published';
  }) => {
    if (!profile) return;
    await createAnnouncement(data, profile, role);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
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
            Cluster Notices & Announcements
          </h1>
          <p className="text-xs text-slate-600">
            Approved notices, schedule adjustments, and messages for {cluster?.name || 'Kimana Cluster'}.
          </p>
        </div>

        {canCreateAnnouncement(role) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-900 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Notice</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-3 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-700/60" />
          <input
            type="text"
            placeholder="Search announcements by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center space-y-2">
          <Megaphone className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No announcements found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No published notices match your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              onClick={() => onNavigate(`/announcements/${ann.id}`)}
              onRefresh={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnnouncementFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateAnnouncement}
      />
    </div>
  );
};
