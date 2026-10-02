import React from 'react';
import { PermissionGate } from '../components/ui/PermissionGate';
import { Calendar, Users, FileText, MapPin, ArrowLeft } from 'lucide-react';
import { getLocalities, PRIMARY_CLUSTER_ID } from '../lib/db';
import { useAuth } from '../lib/auth-context';

export const ActivitiesPlaceholder: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  return (
    <PermissionGate permission="activities.view" showDenialMessage>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-4">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
          <Calendar className="h-10 w-10 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Activities & Calendar (Phase 2)</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The foundation for Phase 1 is verified. The Activities and Calendar modules with approval workflows
            (Draft → Pending Review → Approved → Published) will be implemented in Phase 2.
          </p>
        </div>
      </div>
    </PermissionGate>
  );
};

export const GroupsPlaceholder: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  return (
    <PermissionGate permission="groups.view" showDenialMessage>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-4">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Community Groups (Phase 2)</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Study circles, devotional gatherings, children’s classes, and junior youth groups with strict participant
            privacy and locality clustering are staged for Phase 2.
          </p>
        </div>
      </div>
    </PermissionGate>
  );
};

export const DocumentsPlaceholder: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  return (
    <PermissionGate permission="documents.view" showDenialMessage>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-4">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
          <FileText className="h-10 w-10 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Document Management (Phase 2)</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Protected document repository categorized by Cluster Resources, Guidelines, Training Materials, and Forms with
            private storage URLs staged for Phase 2.
          </p>
        </div>
      </div>
    </PermissionGate>
  );
};

export const CommunitiesPage: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <button
        onClick={() => onNavigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Dashboard</span>
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Localities Directory · {cluster?.name || 'Kimana Cluster'}
        </h1>
        <p className="text-xs text-slate-500">
          Coordinated geographic zones in Kimana. Personal contact rosters are kept private under RLS.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {localities.map((loc) => (
          <div key={loc.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>{loc.name}</span>
              </h3>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Active Zone
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {loc.description || 'Active coordination locality in Kimana Cluster.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
