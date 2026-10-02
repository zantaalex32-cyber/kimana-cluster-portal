import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { Home, LayoutDashboard, Calendar, Search, User, Shield } from 'lucide-react';

interface MobileNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPath, onNavigate }) => {
  const { isAuthenticated, isAtLeast } = useAuth();

  const tabs = [
    {
      label: isAuthenticated ? 'Dashboard' : 'Home',
      path: isAuthenticated ? '/dashboard' : '/',
      icon: isAuthenticated ? LayoutDashboard : Home,
    },
    {
      label: 'Activities',
      path: '/activities',
      icon: Calendar,
    },
    {
      label: 'Search',
      path: '/search',
      icon: Search,
    },
    ...(isAtLeast('cluster_admin')
      ? [
          {
            label: 'Admin',
            path: '/admin',
            icon: Shield,
          },
        ]
      : []),
    {
      label: isAuthenticated ? 'Profile' : 'Sign In',
      path: isAuthenticated ? '/profile' : '/login',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-emerald-900/10 bg-white/95 backdrop-blur-md md:hidden">
      <div className={`grid h-16 items-center px-1 ${tabs.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {tabs.map((tab) => {
          const isActive =
            currentPath === tab.path ||
            (tab.path !== '/' && currentPath.startsWith(tab.path));
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              className={`flex min-h-[44px] flex-col items-center justify-center transition-colors ${
                isActive ? 'text-emerald-900 font-bold' : 'text-slate-500 hover:text-emerald-800'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? 'text-emerald-800 stroke-[2.3]' : 'text-slate-400 stroke-[1.8]'
                }`}
              />
              <span className="mt-1 text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
