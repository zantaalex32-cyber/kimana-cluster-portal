import React from 'react';
import { useAuth } from '../lib/auth-context';
import { ROLE_DEFINITIONS } from '../lib/permissions';
import { RoleBadge } from '../components/ui/RoleBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { User, Mail, Phone, MapPin, Shield, Calendar, Key } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { profile, role, cluster, locality } = useAuth();

  const roleDef = ROLE_DEFINITIONS[role];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-900/5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white font-bold text-xl shadow-xs">
              {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold tracking-tight text-emerald-950 sm:text-2xl">
                {profile?.full_name || 'Public Visitor'}
              </h1>
              <div className="flex items-center gap-2">
                <RoleBadge role={role} />
                <span className="text-emerald-300">·</span>
                <StatusBadge status={profile?.status || 'active'} />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-3.5">
            <Mail className="h-4 w-4 text-emerald-700" />
            <div>
              <div className="text-[11px] text-emerald-900/60 font-semibold">Email Address</div>
              <div className="font-semibold text-emerald-950">{profile?.email || 'N/A'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-3.5">
            <Phone className="h-4 w-4 text-emerald-700" />
            <div>
              <div className="text-[11px] text-emerald-900/60 font-semibold">Phone Number</div>
              <div className="font-semibold text-emerald-950">{profile?.phone || 'Not provided'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-3.5">
            <MapPin className="h-4 w-4 text-emerald-700" />
            <div>
              <div className="text-[11px] text-emerald-900/60 font-semibold">Cluster & Locality</div>
              <div className="font-semibold text-emerald-950">
                {cluster?.name || 'Kimana Cluster'} · {locality?.name || 'Unassigned'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/40 p-3.5">
            <Calendar className="h-4 w-4 text-emerald-700" />
            <div>
              <div className="text-[11px] text-emerald-900/60 font-semibold">Member Since</div>
              <div className="font-semibold text-emerald-950">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Role & Permissions Inspector */}
        <div className="mt-8 pt-6 border-t border-emerald-900/5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950">
            <Shield className="h-4 w-4 text-emerald-700" />
            <span>Assigned Permissions for {roleDef.name}</span>
          </div>

          <p className="text-xs text-slate-600">
            {roleDef.description} Under PostgreSQL RLS policies, users can only access data authorized for these permissions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {roleDef.permissions.map((perm) => (
              <div
                key={perm}
                className="flex items-center gap-2 rounded-lg border border-emerald-900/10 bg-emerald-50/50 px-3 py-2 text-xs text-emerald-950 font-mono"
              >
                <Key className="h-3 w-3 text-emerald-700 shrink-0" />
                <span className="truncate">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Rule Reminder */}
        <div className="mt-8 rounded-xl bg-emerald-900/5 border border-emerald-900/10 p-4 text-xs text-emerald-950">
          <span className="font-bold text-emerald-950">Privilege Escalation Notice:</span> Role
          assignments are governed exclusively on the server and through PostgreSQL Row Level Security.
          Client-side tampering cannot elevate access levels.
        </div>
      </div>
    </div>
  );
};
