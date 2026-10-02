import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AppShell } from './components/navigation/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RequestAccessPage } from './pages/RequestAccessPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAccessRequestsPage } from './pages/admin/AdminAccessRequestsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { TestsPage } from './pages/TestsPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { ActivityDetailPage } from './pages/ActivityDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AnnouncementDetailPage } from './pages/AnnouncementDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CommunitiesPage } from './pages/StagedPages';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const { isAuthenticated, isAtLeast } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Router Logic
  const renderPage = () => {
    // Public routes
    if (currentPath === '/') {
      return <LandingPage onNavigate={navigate} />;
    }
    if (currentPath === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (currentPath === '/request-access') {
      return <RequestAccessPage onNavigate={navigate} />;
    }
    if (currentPath === '/tests') {
      return <TestsPage onNavigate={navigate} />;
    }
    if (currentPath === '/search') {
      return <SearchPage onNavigate={navigate} />;
    }
    if (currentPath === '/communities') {
      return <CommunitiesPage onNavigate={navigate} />;
    }

    // Authenticated Dashboard & Profile
    if (currentPath === '/dashboard') {
      if (!isAuthenticated) {
        return <LoginPage onNavigate={navigate} />;
      }
      return <DashboardPage onNavigate={navigate} />;
    }

    if (currentPath === '/profile') {
      if (!isAuthenticated) {
        return <LoginPage onNavigate={navigate} />;
      }
      return <ProfilePage onNavigate={navigate} />;
    }

    // Phase 2: Activities & Calendar
    if (currentPath === '/activities') {
      return <ActivitiesPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/activities/')) {
      const activityId = currentPath.replace('/activities/', '');
      return <ActivityDetailPage activityId={activityId} onNavigate={navigate} />;
    }
    if (currentPath === '/calendar') {
      return <CalendarPage onNavigate={navigate} />;
    }

    // Phase 2: Groups
    if (currentPath === '/groups') {
      return <GroupsPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/groups/')) {
      const groupId = currentPath.replace('/groups/', '');
      return <GroupDetailPage groupId={groupId} onNavigate={navigate} />;
    }

    // Phase 2: Documents
    if (currentPath === '/documents') {
      return <DocumentsPage onNavigate={navigate} />;
    }

    // Phase 2: Announcements
    if (currentPath === '/announcements') {
      return <AnnouncementsPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/announcements/')) {
      const announcementId = currentPath.replace('/announcements/', '');
      return <AnnouncementDetailPage announcementId={announcementId} onNavigate={navigate} />;
    }

    // Admin routes with strict clearance gate
    if (currentPath === '/admin') {
      if (!isAtLeast('cluster_admin')) {
        return (
          <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
            <h2 className="text-xl font-bold text-rose-950">Access Denied (403)</h2>
            <p className="text-xs text-rose-700">
              Administrative clearance is required to view the cluster management console.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white"
            >
              Return to Dashboard
            </button>
          </div>
        );
      }
      return <AdminDashboardPage onNavigate={navigate} />;
    }

    if (currentPath === '/admin/access-requests') {
      if (!isAtLeast('cluster_admin')) {
        return (
          <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
            <h2 className="text-xl font-bold text-rose-950">Access Denied (403)</h2>
            <p className="text-xs text-rose-700">
              Only cluster administrators can review access requests.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white"
            >
              Return to Dashboard
            </button>
          </div>
        );
      }
      return <AdminAccessRequestsPage onNavigate={navigate} />;
    }

    if (currentPath === '/admin/users') {
      if (!isAtLeast('cluster_admin')) {
        return (
          <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
            <h2 className="text-xl font-bold text-rose-950">Access Denied (403)</h2>
            <p className="text-xs text-rose-700">
              Unauthorized to view internal user directory.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white"
            >
              Return to Dashboard
            </button>
          </div>
        );
      }
      return <AdminUsersPage onNavigate={navigate} />;
    }

    if (currentPath === '/admin/audit') {
      if (!isAtLeast('cluster_admin')) {
        return (
          <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
            <h2 className="text-xl font-bold text-rose-950">Access Denied (403)</h2>
            <p className="text-xs text-rose-700">
              Audit log is restricted to verified administrators.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white"
            >
              Return to Dashboard
            </button>
          </div>
        );
      }
      return <AdminAuditLogPage onNavigate={navigate} />;
    }

    // Default fallback to Landing Page
    return <LandingPage onNavigate={navigate} />;
  };

  return (
    <AppShell currentPath={currentPath} onNavigate={navigate}>
      {renderPage()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
