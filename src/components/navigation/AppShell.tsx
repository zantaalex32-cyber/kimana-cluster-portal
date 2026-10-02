import React from 'react';
import { AppHeader } from './AppHeader';
import { MobileNavigation } from './MobileNavigation';
import { RoleSwitcherBar } from './RoleSwitcherBar';

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentPath, onNavigate, children }) => {
  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900 flex flex-col font-sans">
      {/* RBAC Role Switcher Bar for testing & demonstration */}
      <RoleSwitcherBar />

      {/* Top Navigation */}
      <AppHeader currentPath={currentPath} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-12">
        {children}
      </main>

      {/* Quiet, compliant footer */}
      <footer className="hidden md:block border-t border-emerald-900/10 bg-white/70 py-6 text-center text-xs text-emerald-900/70 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Kimana Cluster Portal · Dignified community coordination platform.</p>
          <div className="flex items-center gap-4 text-emerald-800/80">
            <span>Kimana Cluster (Kajiado South)</span>
            <span>·</span>
            <span>PostgreSQL RLS Active</span>
            <span>·</span>
            <button onClick={() => onNavigate('/tests')} className="hover:text-emerald-950 font-medium underline">
              Run RBAC & RLS Tests
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNavigation currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
};
