-- ==============================================================================
-- KIMANA CLUSTER PORTAL - DATABASE SEED DATA
-- Fictional Demonstration Data
-- ==============================================================================

-- 1. SEED CLUSTERS
INSERT INTO public.clusters (id, name, description, region, status)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Kimana Cluster', 'Information and coordination cluster for Kimana and surrounding localities at the foot of Mount Kilimanjaro.', 'Kajiado South', 'active'),
    ('c2222222-2222-2222-2222-222222222222', 'Amboseli Border Cluster', 'Demonstration secondary cluster used for testing cross-cluster authorization boundaries.', 'Amboseli Basin', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. SEED LOCALITIES
INSERT INTO public.localities (id, cluster_id, name, description, status)
VALUES
    ('l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Kimana Central', 'Town center and central coordination locality', 'active'),
    ('l2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Isinet Locality', 'Agricultural community and northern coordination unit', 'active'),
    ('l3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Namelok Locality', 'Springs region and eastern community gathering', 'active'),
    ('l4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Tikondo Locality', 'Western pastoral locality and community groups', 'active'),
    -- Locality in Secondary Cluster (for cross-cluster isolation testing)
    ('l9999999-9999-9999-9999-999999999999', 'c2222222-2222-2222-2222-222222222222', 'Amboseli Gate Locality', 'Border community in Cluster B', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED ROLES
INSERT INTO public.roles (id, name, description, hierarchy_level)
VALUES
    ('public', 'Public Visitor', 'Unauthenticated or guest user with access strictly to approved public information.', 1),
    ('member', 'Cluster Member', 'Verified member with access to routine member activities, groups, and documents.', 2),
    ('coordinator', 'Activity Coordinator', 'Coordinates specific activities, study groups, or educational classes.', 3),
    ('cluster_admin', 'Cluster Administrator', 'Manages cluster information, users, approvals, localities, and settings.', 4),
    ('super_admin', 'Super Administrator', 'System-level authority with multi-cluster management and security controls.', 5)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 4. SEED GRANULAR PERMISSIONS
INSERT INTO public.permissions (id, name, category, description)
VALUES
    ('users.view', 'View Users', 'Users', 'View member profiles in the cluster'),
    ('users.approve', 'Approve Access Requests', 'Users', 'Review and approve new member access requests'),
    ('users.edit', 'Edit User Profiles', 'Users', 'Update profile details and assignments'),
    ('users.suspend', 'Suspend Users', 'Users', 'Suspend or reactivate user access'),
    ('activities.view', 'View Activities', 'Activities', 'View activities appropriate to user clearance'),
    ('activities.create', 'Create Activities', 'Activities', 'Create new draft activities'),
    ('activities.edit', 'Edit Activities', 'Activities', 'Edit existing activity details'),
    ('activities.delete', 'Delete Activities', 'Activities', 'Remove or archive activities'),
    ('activities.approve', 'Approve Activities', 'Activities', 'Approve and publish activities to the calendar'),
    ('groups.view', 'View Groups', 'Groups', 'View community study circles and youth groups'),
    ('groups.create', 'Create Groups', 'Groups', 'Register a new community group'),
    ('groups.edit', 'Edit Groups', 'Groups', 'Modify group schedules and details'),
    ('groups.delete', 'Delete Groups', 'Groups', 'Archive or delete groups'),
    ('documents.view', 'View Documents', 'Documents', 'Access approved cluster documents and resources'),
    ('documents.upload', 'Upload Documents', 'Documents', 'Upload new files to document library'),
    ('documents.edit', 'Edit Documents', 'Documents', 'Edit document metadata'),
    ('documents.delete', 'Delete Documents', 'Documents', 'Archive or delete documents'),
    ('documents.approve', 'Approve Documents', 'Documents', 'Approve uploaded documents for library publication'),
    ('announcements.view', 'View Announcements', 'Announcements', 'Read cluster announcements'),
    ('announcements.create', 'Create Announcements', 'Announcements', 'Draft new announcements'),
    ('announcements.edit', 'Edit Announcements', 'Announcements', 'Edit announcement drafts'),
    ('announcements.publish', 'Publish Announcements', 'Announcements', 'Publish announcements cluster-wide'),
    ('announcements.delete', 'Delete Announcements', 'Announcements', 'Archive or delete announcements'),
    ('reports.view', 'View Reports', 'Reports', 'Access statistical summaries and community reports'),
    ('ai.use', 'Use AI Assistant', 'AI', 'Query the Kimana Cluster Assistant for approved information'),
    ('ai.manage_knowledge', 'Manage AI Knowledge', 'AI', 'Index, update, and manage RAG documents and embeddings'),
    ('audit.view', 'View Audit Logs', 'Audit', 'Review administrative actions and security logs'),
    ('settings.manage', 'Manage Settings', 'Settings', 'Update cluster configurations and locality settings')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED ROLE PERMISSIONS
-- Member permissions
INSERT INTO public.role_permissions (role_id, permission_id)
VALUES
    ('member', 'activities.view'),
    ('member', 'groups.view'),
    ('member', 'documents.view'),
    ('member', 'announcements.view'),
    ('member', 'ai.use')
ON CONFLICT DO NOTHING;

-- Coordinator permissions (inherits member + creation & editing)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'coordinator', permission_id FROM public.role_permissions WHERE role_id = 'member'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
VALUES
    ('coordinator', 'activities.create'),
    ('coordinator', 'activities.edit'),
    ('coordinator', 'groups.create'),
    ('coordinator', 'groups.edit'),
    ('coordinator', 'documents.upload'),
    ('coordinator', 'announcements.create')
ON CONFLICT DO NOTHING;

-- Cluster Admin permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'cluster_admin', id FROM public.permissions
WHERE id NOT IN ('ai.manage_knowledge') -- reserved or shared
ON CONFLICT DO NOTHING;

-- Super Admin permissions (All)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'super_admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- 6. SEED FICTIONAL AUDIT LOG
INSERT INTO public.audit_logs (id, user_id, cluster_id, action, entity_type, entity_id, metadata)
VALUES
    ('a1111111-1111-1111-1111-111111111111', NULL, 'c1111111-1111-1111-1111-111111111111', 'SYSTEM_INITIALIZATION', 'cluster', 'c1111111-1111-1111-1111-111111111111', '{"note": "Initial schema migration and Kimana Cluster initialized with RBAC."}'::jsonb)
ON CONFLICT DO NOTHING;
