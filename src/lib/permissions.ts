import { PermissionCode, RoleDefinition, RoleType } from '../types';

/**
 * Role Definitions with Granular Permission Sets
 */
export const ROLE_DEFINITIONS: Record<RoleType, RoleDefinition> = {
  public: {
    id: 'public',
    name: 'Public Visitor',
    description: 'Unauthenticated visitor or guest with access strictly to approved public information.',
    hierarchy_level: 1,
    permissions: [
      'activities.view',     // Only public-visible activities
      'announcements.view',  // Only public-visible announcements
    ],
  },
  member: {
    id: 'member',
    name: 'Cluster Member',
    description: 'Verified member of the cluster with routine member access.',
    hierarchy_level: 2,
    permissions: [
      'activities.view',
      'groups.view',
      'documents.view',
      'announcements.view',
      'ai.use',
    ],
  },
  coordinator: {
    id: 'coordinator',
    name: 'Activity Coordinator',
    description: 'Coordinates cluster activities, devotional meetings, and educational groups.',
    hierarchy_level: 3,
    permissions: [
      'activities.view',
      'activities.create',
      'activities.edit',
      'groups.view',
      'groups.create',
      'groups.edit',
      'documents.view',
      'documents.upload',
      'announcements.view',
      'announcements.create',
      'ai.use',
    ],
  },
  cluster_admin: {
    id: 'cluster_admin',
    name: 'Cluster Administrator',
    description: 'Administrator for cluster members, approvals, localities, and coordination.',
    hierarchy_level: 4,
    permissions: [
      'users.view',
      'users.approve',
      'users.edit',
      'users.suspend',
      'activities.view',
      'activities.create',
      'activities.edit',
      'activities.delete',
      'activities.approve',
      'groups.view',
      'groups.create',
      'groups.edit',
      'groups.delete',
      'documents.view',
      'documents.upload',
      'documents.edit',
      'documents.delete',
      'documents.approve',
      'announcements.view',
      'announcements.create',
      'announcements.edit',
      'announcements.publish',
      'announcements.delete',
      'reports.view',
      'ai.use',
      'ai.manage_knowledge',
      'audit.view',
      'settings.manage',
    ],
  },
  super_admin: {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'System-wide governance, multi-cluster oversight, and platform security management.',
    hierarchy_level: 5,
    permissions: [
      'users.view',
      'users.approve',
      'users.edit',
      'users.suspend',
      'activities.view',
      'activities.create',
      'activities.edit',
      'activities.delete',
      'activities.approve',
      'groups.view',
      'groups.create',
      'groups.edit',
      'groups.delete',
      'documents.view',
      'documents.upload',
      'documents.edit',
      'documents.delete',
      'documents.approve',
      'announcements.view',
      'announcements.create',
      'announcements.edit',
      'announcements.publish',
      'announcements.delete',
      'reports.view',
      'ai.use',
      'ai.manage_knowledge',
      'audit.view',
      'settings.manage',
    ],
  },
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: RoleType | undefined, permission: PermissionCode): boolean {
  if (!role) return false;
  const def = ROLE_DEFINITIONS[role];
  if (!def) return false;
  return def.permissions.includes(permission);
}

/**
 * Check if user has one of the allowed roles
 */
export function hasRole(currentRole: RoleType | undefined, allowedRoles: RoleType | RoleType[]): boolean {
  if (!currentRole) return false;
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(currentRole);
  }
  return currentRole === allowedRoles;
}

/**
 * Hierarchy level comparator
 */
export function isAtLeastRole(currentRole: RoleType | undefined, minRole: RoleType): boolean {
  if (!currentRole) return false;
  const currentLevel = ROLE_DEFINITIONS[currentRole]?.hierarchy_level || 0;
  const minLevel = ROLE_DEFINITIONS[minRole]?.hierarchy_level || 0;
  return currentLevel >= minLevel;
}

/**
 * Prevent privilege escalation:
 * An actor can only assign or modify a role strictly lower or equal to their level,
 * and cannot elevate themselves beyond their permitted role.
 */
export function canAssignRole(actorRole: RoleType, targetRole: RoleType): boolean {
  if (actorRole === 'super_admin') return true;
  if (actorRole === 'cluster_admin') {
    // Cluster admin can assign member or coordinator, but cannot create super_admin or alter cluster_admin
    return targetRole === 'member' || targetRole === 'coordinator';
  }
  return false;
}

/**
 * Multi-cluster isolation validation:
 * Verifies whether an actor is authorized to access data belonging to targetClusterId.
 * Super admin can access any cluster; cluster admin and below can only access their own cluster.
 */
export function canAccessCluster(userClusterId: string | undefined, targetClusterId: string, role: RoleType): boolean {
  if (role === 'super_admin') return true;
  if (!userClusterId) return false;
  return userClusterId === targetClusterId;
}

// ==============================================================================
// PHASE 2 CENTRALIZED CONTENT VISIBILITY & AUTHORIZATION LOGIC
// ==============================================================================

import { Activity, Announcement, DocumentItem, Group, Profile } from '../types';

/**
 * Activity Visibility Rules
 */
export function canViewActivity(
  user: Profile | null,
  role: RoleType,
  activity: Activity
): boolean {
  if (role === 'super_admin') return true;

  // Unauthenticated / Public visitor
  if (!user || role === 'public') {
    return activity.status === 'published' && activity.visibility === 'public';
  }

  // Cross-cluster isolation
  if (activity.cluster_id !== user.cluster_id) return false;

  // Creator can always view their own activity
  if (activity.created_by === user.id) return true;

  // Cluster Admin has complete cluster oversight
  if (role === 'cluster_admin') return true;

  // Coordinator visibility
  if (role === 'coordinator') {
    if (activity.status === 'published') {
      return activity.visibility === 'public' || activity.visibility === 'members' || activity.visibility === 'coordinators';
    }
    // Can also view draft/pending activities they participate in or coordinate
    return activity.status === 'pending_review' || activity.status === 'approved';
  }

  // Verified Member visibility
  if (role === 'member') {
    return activity.status === 'published' && (activity.visibility === 'public' || activity.visibility === 'members');
  }

  return false;
}

export function canCreateActivity(role: RoleType): boolean {
  return hasPermission(role, 'activities.create');
}

export function canEditActivity(
  user: Profile | null,
  role: RoleType,
  activity: Activity
): boolean {
  if (role === 'super_admin') return true;
  if (!user || activity.cluster_id !== user.cluster_id) return false;
  if (role === 'cluster_admin') return true;
  if (role === 'coordinator' && activity.created_by === user.id && activity.status !== 'archived') {
    return hasPermission(role, 'activities.edit');
  }
  return false;
}

export function canApproveActivity(role: RoleType): boolean {
  return hasPermission(role, 'activities.approve');
}

export function canPublishActivity(role: RoleType): boolean {
  // Only administrators can publish cluster-wide activities
  return role === 'cluster_admin' || role === 'super_admin';
}

export function canDeleteActivity(role: RoleType): boolean {
  return hasPermission(role, 'activities.delete');
}

/**
 * Group Visibility & Management Rules
 */
export function canViewGroup(
  user: Profile | null,
  role: RoleType,
  group: Group
): boolean {
  if (role === 'super_admin') return true;
  if (!user || role === 'public') {
    return group.visibility === 'public' && group.status === 'active';
  }
  if (group.cluster_id !== user.cluster_id) return false;
  if (role === 'cluster_admin' || role === 'coordinator') return true;
  return group.status === 'active' && (group.visibility === 'public' || group.visibility === 'members');
}

export function canCreateGroup(role: RoleType): boolean {
  return hasPermission(role, 'groups.create');
}

export function canEditGroup(
  user: Profile | null,
  role: RoleType,
  group: Group
): boolean {
  if (role === 'super_admin') return true;
  if (!user || group.cluster_id !== user.cluster_id) return false;
  if (role === 'cluster_admin') return true;
  if (role === 'coordinator' && group.created_by === user.id) {
    return hasPermission(role, 'groups.edit');
  }
  return false;
}

/**
 * Document Visibility & Download Rules
 */
export function canViewDocument(
  user: Profile | null,
  role: RoleType,
  doc: DocumentItem
): boolean {
  if (role === 'super_admin') return true;
  if (!user || role === 'public') {
    return doc.status === 'published' && doc.visibility === 'public';
  }
  if (doc.cluster_id !== user.cluster_id) return false;
  if (doc.uploaded_by === user.id) return true;
  if (role === 'cluster_admin') return true;

  if (doc.status !== 'published') return false;

  if (role === 'coordinator') {
    return doc.visibility === 'public' || doc.visibility === 'members' || doc.visibility === 'coordinators';
  }

  if (role === 'member') {
    return doc.visibility === 'public' || doc.visibility === 'members';
  }

  return false;
}

export function canUploadDocument(role: RoleType): boolean {
  return hasPermission(role, 'documents.upload');
}

export function canApproveDocument(role: RoleType): boolean {
  return hasPermission(role, 'documents.approve');
}

export function canDeleteDocument(role: RoleType): boolean {
  return hasPermission(role, 'documents.delete');
}

/**
 * Announcement Visibility & Publication Rules
 */
export function canViewAnnouncement(
  user: Profile | null,
  role: RoleType,
  ann: Announcement
): boolean {
  if (role === 'super_admin') return true;
  if (!user || role === 'public') {
    return ann.status === 'published' && ann.visibility === 'public';
  }
  if (ann.cluster_id !== user.cluster_id) return false;
  if (ann.created_by === user.id) return true;
  if (role === 'cluster_admin') return true;

  if (ann.status !== 'published') return false;

  if (role === 'coordinator') {
    return ann.visibility === 'public' || ann.visibility === 'members' || ann.visibility === 'coordinators';
  }

  if (role === 'member') {
    return ann.visibility === 'public' || ann.visibility === 'members';
  }

  return false;
}

export function canCreateAnnouncement(role: RoleType): boolean {
  return hasPermission(role, 'announcements.create');
}

export function canPublishAnnouncement(role: RoleType): boolean {
  return hasPermission(role, 'announcements.publish');
}

