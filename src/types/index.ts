/**
 * Kimana Cluster Portal - Domain Types
 * Strict typing for Multi-Cluster Architecture, RBAC, Profiles, Security,
 * and Phase 2 Core Information (Activities, Calendar, Groups, Documents, Announcements, Search)
 */

export type RoleType = 'public' | 'member' | 'coordinator' | 'cluster_admin' | 'super_admin';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export type AccessRequestStatus = 'pending' | 'approved' | 'rejected';

export type ContentVisibility = 'public' | 'members' | 'coordinators' | 'admins';

export type PermissionCode =
  | 'users.view'
  | 'users.approve'
  | 'users.edit'
  | 'users.suspend'
  | 'activities.view'
  | 'activities.create'
  | 'activities.edit'
  | 'activities.delete'
  | 'activities.approve'
  | 'groups.view'
  | 'groups.create'
  | 'groups.edit'
  | 'groups.delete'
  | 'documents.view'
  | 'documents.upload'
  | 'documents.edit'
  | 'documents.delete'
  | 'documents.approve'
  | 'announcements.view'
  | 'announcements.create'
  | 'announcements.edit'
  | 'announcements.publish'
  | 'announcements.delete'
  | 'reports.view'
  | 'ai.use'
  | 'ai.manage_knowledge'
  | 'audit.view'
  | 'settings.manage';

export interface Cluster {
  id: string;
  name: string;
  description: string;
  region: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Locality {
  id: string;
  cluster_id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  cluster_id: string;
  locality_id?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role_id: RoleType;
  cluster_id: string;
  assigned_at: string;
  assigned_by?: string;
}

export interface AccessRequest {
  id: string;
  cluster_id: string;
  full_name: string;
  email: string;
  phone?: string;
  locality_id?: string;
  reason: string;
  status: AccessRequestStatus;
  assigned_role?: RoleType;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: RoleType;
  cluster_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  cluster_id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'approval' | 'system';
  read: boolean;
  link?: string;
  created_at: string;
}

export interface RoleDefinition {
  id: RoleType;
  name: string;
  description: string;
  hierarchy_level: number;
  permissions: PermissionCode[];
}

// ==============================================================================
// PHASE 2 DOMAIN TYPES: CORE INFORMATION
// ==============================================================================

export type ActivityStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'cancelled'
  | 'archived';

export interface Activity {
  id: string;
  cluster_id: string;
  locality_id?: string;
  title: string;
  description?: string;
  activity_type: string;
  start_time: string;
  end_time?: string;
  location?: string;
  visibility: ContentVisibility;
  status: ActivityStatus;
  created_by: string;
  creator_name?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export type GroupType =
  | 'Study Circle'
  | 'Devotional Meeting'
  | "Children's Class"
  | 'Junior Youth Group'
  | 'Other';

export type GroupStatus = 'active' | 'inactive' | 'archived';

export interface Group {
  id: string;
  cluster_id: string;
  locality_id?: string;
  name: string;
  group_type: GroupType;
  description?: string;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
  visibility: ContentVisibility;
  status: GroupStatus;
  created_by: string;
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory =
  | 'Cluster Resources'
  | 'Activity Resources'
  | 'Training Materials'
  | 'Guidelines'
  | 'Forms'
  | 'Reports'
  | 'Other';

export type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export interface DocumentItem {
  id: string;
  cluster_id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  file_path: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  visibility: ContentVisibility;
  status: DocumentStatus;
  uploaded_by: string;
  uploader_name?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export type AnnouncementStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'archived';

export interface Announcement {
  id: string;
  cluster_id: string;
  title: string;
  content: string;
  visibility: ContentVisibility;
  status: AnnouncementStatus;
  published_at?: string;
  created_by: string;
  creator_name?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchResultItem {
  id: string;
  type: 'activity' | 'group' | 'document' | 'announcement' | 'locality';
  title: string;
  description?: string;
  date?: string;
  locality_name?: string;
  status?: string;
  visibility?: ContentVisibility;
  path: string;
}
