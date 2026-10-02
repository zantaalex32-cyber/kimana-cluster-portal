import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { RoleBadge } from '../ui/RoleBadge';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { LogOut, User, Search } from 'lucide-react';

interface AppHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentPath, onNavigate }) => {
  const { isAuthenticated, profile, role, signOut, isAtLeast } = useAuth();

  const navLinks = [
    { label: 'Overview', path: '/' },
    ...(isAuthenticated
      ? [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Activities', path: '/activities' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Groups', path: '/groups' },
          { label: 'Documents', path: '/documents' },
          { label: 'Notices', path: '/announcements' },
        ]
      : []),
    ...(isAtLeast('cluster_admin')
      ? [
          { label: 'Admin', path: '/admin' },
        ]
      : []),
    { label: 'Tests', path: '/tests' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-900/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onNavigate(isAuthenticated ? '/dashboard' : '/')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <img src="/icon.svg" alt="Kimana Portal Logo" className="h-8 w-8 rounded-lg shadow-xs transition group-hover:scale-105" />
          <span className="text-base font-bold tracking-tight text-emerald-950 sm:text-lg">
            Kimana Cluster Portal
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-emerald-900/70">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`transition-colors hover:text-emerald-950 ${
                  isActive ? 'text-emerald-950 font-bold underline underline-offset-8 decoration-2 decoration-emerald-600' : ''
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('/search')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-900/15 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/70 transition"
            title="Global Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <PWAInstallButton />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/profile')}
                className="hidden sm:flex flex-col items-end text-right hover:opacity-85 transition"
              >
                <span className="text-xs font-semibold text-emerald-950">{profile?.full_name}</span>
                <RoleBadge role={role} />
              </button>

              <button
                onClick={() => onNavigate('/profile')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-900/15 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100/70 transition"
                title="View Profile"
              >
                <User className="h-4 w-4" />
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  onNavigate('/');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-900/15 bg-emerald-50/60 text-emerald-800 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/request-access')}
                className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-950 transition"
              >
                Request Access
              </button>
              <button
                onClick={() => onNavigate('/login')}
                className="min-h-[40px] rounded-lg bg-emerald-800 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-900"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
