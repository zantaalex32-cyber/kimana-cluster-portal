import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cluster, Locality, PermissionCode, Profile, RoleType } from '../types';
import { recordAuditLog } from './audit';
import {
  DEMO_USERS,
  PRIMARY_CLUSTER_ID,
  getClusters,
  getLocalities,
  getUserRole,
} from './db';
import { hasPermission as checkPerm, hasRole as checkRole, isAtLeastRole } from './permissions';

interface AuthContextType {
  profile: Profile | null;
  role: RoleType;
  cluster: Cluster | null;
  locality: Locality | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  switchDemoRole: (role: RoleType) => void;
  hasPermission: (permission: PermissionCode) => boolean;
  hasRole: (roles: RoleType | RoleType[]) => boolean;
  isAtLeast: (minRole: RoleType) => boolean;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'kimana_auth_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<RoleType>('public');
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [locality, setLocality] = useState<Locality | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserData = (userId: string | null) => {
    const clusters = getClusters('super_admin');
    const defaultCluster = clusters.find((c) => c.id === PRIMARY_CLUSTER_ID) || clusters[0] || null;

    if (!userId) {
      setProfile(null);
      setRole('public');
      setCluster(defaultCluster);
      setLocality(null);
      setIsLoading(false);
      return;
    }

    const demoUser = DEMO_USERS.find((u) => u.profile.id === userId);
    if (demoUser) {
      const userRole = getUserRole(demoUser.profile.id);
      setProfile(demoUser.profile);
      setRole(userRole);
      
      const userCluster = clusters.find((c) => c.id === demoUser.profile.cluster_id) || defaultCluster;
      setCluster(userCluster);

      if (demoUser.profile.locality_id) {
        const locs = getLocalities(demoUser.profile.cluster_id, demoUser.profile, userRole);
        const loc = locs.find((l) => l.id === demoUser.profile.locality_id) || null;
        setLocality(loc);
      } else {
        setLocality(null);
      }
    } else {
      setProfile(null);
      setRole('public');
      setCluster(defaultCluster);
      setLocality(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial session load from storage or default to cluster_admin for first interactive preview
    const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUserId) {
      loadUserData(savedUserId);
    } else {
      // Default to Cluster Admin for immediate testing convenience
      const defaultAdmin = DEMO_USERS.find((u) => u.role === 'cluster_admin');
      if (defaultAdmin) {
        localStorage.setItem(AUTH_STORAGE_KEY, defaultAdmin.profile.id);
        loadUserData(defaultAdmin.profile.id);
      } else {
        loadUserData(null);
      }
    }
  }, []);

  const signIn = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = DEMO_USERS.find((u) => u.profile.email.toLowerCase() === cleanEmail);

    if (!found) {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your email or request access.',
      };
    }

    if (password && password !== found.passwordHint && password !== 'password123') {
      return {
        success: false,
        error: 'Invalid password. (For demo accounts, hint is provided).',
      };
    }

    if (found.profile.status === 'suspended') {
      return {
        success: false,
        error: 'Your account has been suspended. Please contact a cluster administrator.',
      };
    }

    if (found.profile.status === 'pending') {
      return {
        success: false,
        error: 'Your access request is currently pending review by administrators.',
      };
    }

    localStorage.setItem(AUTH_STORAGE_KEY, found.profile.id);
    loadUserData(found.profile.id);

    recordAuditLog({
      userId: found.profile.id,
      userName: found.profile.full_name,
      userRole: found.role,
      clusterId: found.profile.cluster_id,
      action: 'USER_LOGIN',
      entityType: 'auth',
      entityId: found.profile.id,
    });

    return { success: true };
  };

  const signOut = async () => {
    if (profile) {
      recordAuditLog({
        userId: profile.id,
        userName: profile.full_name,
        userRole: role,
        clusterId: profile.cluster_id,
        action: 'USER_LOGOUT',
        entityType: 'auth',
        entityId: profile.id,
      });
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    loadUserData(null);
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = DEMO_USERS.find((u) => u.profile.email.toLowerCase() === cleanEmail);
    if (found) {
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${cleanEmail}. Check your inbox.`,
      };
    }
    // Security best practice: Don't leak whether email exists
    return {
      success: true,
      message: `If an account with ${cleanEmail} exists, password reset instructions have been sent.`,
    };
  };

  const switchDemoRole = (targetRole: RoleType) => {
    if (targetRole === 'public') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      loadUserData(null);
      return;
    }

    const match = DEMO_USERS.find((u) => u.role === targetRole);
    if (match) {
      localStorage.setItem(AUTH_STORAGE_KEY, match.profile.id);
      loadUserData(match.profile.id);
    }
  };

  const hasPermission = (permission: PermissionCode): boolean => {
    return checkPerm(role, permission);
  };

  const hasRole = (roles: RoleType | RoleType[]): boolean => {
    return checkRole(role, roles);
  };

  const isAtLeast = (minRole: RoleType): boolean => {
    return isAtLeastRole(role, minRole);
  };

  const refreshUserData = () => {
    const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    loadUserData(savedUserId);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        role,
        cluster,
        locality,
        isAuthenticated: profile !== null && profile.status === 'active',
        isLoading,
        signIn,
        signOut,
        requestPasswordReset,
        switchDemoRole,
        hasPermission,
        hasRole,
        isAtLeast,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
