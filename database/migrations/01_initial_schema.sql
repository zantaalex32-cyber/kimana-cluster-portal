-- ==============================================================================
-- KIMANA CLUSTER PORTAL - DATABASE MIGRATION 01: INITIAL SCHEMA & RLS
-- Dialect: PostgreSQL / Supabase
-- Description: Core tables, multi-cluster architecture, RBAC, access requests, 
--              audit logging, and Row Level Security (RLS) policies.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLUSTERS TABLE
CREATE TABLE IF NOT EXISTS public.clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    region VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for clusters
CREATE INDEX IF NOT EXISTS idx_clusters_status ON public.clusters(status);

-- 2. LOCALITIES TABLE
CREATE TABLE IF NOT EXISTS public.localities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cluster_id, name)
);

CREATE INDEX IF NOT EXISTS idx_localities_cluster_id ON public.localities(cluster_id);
CREATE INDEX IF NOT EXISTS idx_localities_status ON public.localities(status);

-- 3. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT
);

-- 5. ROLE_PERMISSIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id VARCHAR(50) NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 6. PROFILES TABLE (Supabase auth.users profile extension)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    avatar_url TEXT,
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE RESTRICT,
    locality_id UUID REFERENCES public.localities(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_cluster_id ON public.profiles(cluster_id);
CREATE INDEX IF NOT EXISTS idx_profiles_locality_id ON public.profiles(locality_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 7. USER_ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(user_id, role_id, cluster_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_cluster_id ON public.user_roles(cluster_id);

-- 8. ACCESS_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    locality_id UUID REFERENCES public.localities(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    assigned_role VARCHAR(50) REFERENCES public.roles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_cluster ON public.access_requests(cluster_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON public.access_requests(email);

-- 9. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cluster_id UUID REFERENCES public.clusters(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cluster_id ON public.audit_logs(cluster_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'alert', 'approval', 'system')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- ==============================================================================
-- HELPER FUNCTIONS FOR SECURITY AND RLS
-- ==============================================================================

-- Function to get the current requesting user's active cluster ID
CREATE OR REPLACE FUNCTION public.get_auth_user_cluster()
RETURNS UUID AS $$
    SELECT cluster_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if current user has a specific role in a cluster
CREATE OR REPLACE FUNCTION public.has_role(role_name VARCHAR)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role_id = role_name
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if current user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role_id IN ('cluster_admin', 'super_admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if current user is a super administrator
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role_id = 'super_admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if current user has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(perm_code VARCHAR)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        WHERE ur.user_id = auth.uid()
          AND rp.permission_id = perm_code
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS tr_clusters_updated_at ON public.clusters;
CREATE TRIGGER tr_clusters_updated_at BEFORE UPDATE ON public.clusters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_localities_updated_at ON public.localities;
CREATE TRIGGER tr_localities_updated_at BEFORE UPDATE ON public.localities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_access_requests_updated_at ON public.access_requests;
CREATE TRIGGER tr_access_requests_updated_at BEFORE UPDATE ON public.access_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every table
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. CLUSTERS POLICIES
-- Public & Authenticated users can view active clusters
CREATE POLICY clusters_select_active ON public.clusters
    FOR SELECT
    USING (status = 'active' OR public.is_super_admin());

-- Only super administrators can insert, update or delete clusters
CREATE POLICY clusters_admin_manage ON public.clusters
    FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 2. LOCALITIES POLICIES
-- Anyone can view active localities of their cluster
CREATE POLICY localities_select ON public.localities
    FOR SELECT
    USING (
        status = 'active' 
        AND (
            auth.uid() IS NULL 
            OR cluster_id = public.get_auth_user_cluster()
            OR public.is_super_admin()
        )
    );

-- Only cluster admins and super admins can manage localities
CREATE POLICY localities_admin_manage ON public.localities
    FOR ALL
    USING (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    );

-- 3. ROLES & PERMISSIONS POLICIES
-- Roles and permissions are readable by authenticated users
CREATE POLICY roles_select ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_select ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_select ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- 4. PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY profiles_select_self ON public.profiles
    FOR SELECT
    USING (id = auth.uid());

-- Cluster Admins & Coordinators can view members within their cluster
CREATE POLICY profiles_select_cluster_members ON public.profiles
    FOR SELECT
    USING (
        public.is_super_admin() 
        OR (
            (public.is_admin() OR public.has_role('coordinator')) 
            AND cluster_id = public.get_auth_user_cluster()
        )
    );

-- Users can update only their own profile non-sensitive fields
CREATE POLICY profiles_update_self ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() 
        AND status = (SELECT status FROM public.profiles WHERE id = auth.uid()) -- Prevents self-activating
    );

-- Admins can update profiles in their cluster (e.g. status changes)
CREATE POLICY profiles_admin_update ON public.profiles
    FOR UPDATE
    USING (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    );

-- 5. USER_ROLES POLICIES
-- Users can read their own assigned roles
CREATE POLICY user_roles_select_self ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can read all roles in their cluster
CREATE POLICY user_roles_select_admin ON public.user_roles
    FOR SELECT
    USING (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    );

-- Only cluster admins and super admins can insert, update or delete user roles
CREATE POLICY user_roles_admin_manage ON public.user_roles
    FOR ALL
    USING (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    );

-- 6. ACCESS_REQUESTS POLICIES
-- Public and users can submit access requests
CREATE POLICY access_requests_insert ON public.access_requests
    FOR INSERT
    WITH CHECK (true);

-- Users can view their own request by email or user ID
CREATE POLICY access_requests_select_own ON public.access_requests
    FOR SELECT
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Cluster admins can view and manage requests for their cluster
CREATE POLICY access_requests_admin_manage ON public.access_requests
    FOR ALL
    USING (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    );

-- 7. AUDIT_LOGS POLICIES
-- Only cluster admins and super admins can view audit logs
CREATE POLICY audit_logs_select_admin ON public.audit_logs
    FOR SELECT
    USING (
        public.is_super_admin() 
        OR (public.is_admin() AND cluster_id = public.get_auth_user_cluster())
    );

-- Insertion into audit logs allowed for system actions
CREATE POLICY audit_logs_insert ON public.audit_logs
    FOR INSERT
    WITH CHECK (true);

-- 8. NOTIFICATIONS POLICIES
-- Users can view and update (mark read) only their own notifications
CREATE POLICY notifications_user_manage ON public.notifications
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
