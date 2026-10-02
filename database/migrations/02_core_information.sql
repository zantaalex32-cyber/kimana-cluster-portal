-- ==============================================================================
-- KIMANA CLUSTER PORTAL - DATABASE MIGRATION 02: CORE INFORMATION SYSTEM
-- Dialect: PostgreSQL / Supabase
-- Description: Activities, Groups, Documents, Announcements, RLS Policies, 
--              and Storage Security Policies.
-- ==============================================================================

-- 1. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    locality_id UUID REFERENCES public.localities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location TEXT,
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'coordinators', 'admins')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'cancelled', 'archived')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_cluster_id ON public.activities(cluster_id);
CREATE INDEX IF NOT EXISTS idx_activities_locality_id ON public.activities(locality_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_time ON public.activities(start_time ASC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_visibility ON public.activities(visibility);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON public.activities(created_by);

-- 2. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    locality_id UUID REFERENCES public.localities(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    group_type TEXT NOT NULL CHECK (group_type IN ('Study Circle', 'Devotional Meeting', 'Children''s Class', 'Junior Youth Group', 'Other')),
    description TEXT,
    meeting_day TEXT,
    meeting_time TEXT,
    location TEXT,
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'coordinators', 'admins')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_cluster_id ON public.groups(cluster_id);
CREATE INDEX IF NOT EXISTS idx_groups_locality_id ON public.groups(locality_id);
CREATE INDEX IF NOT EXISTS idx_groups_status ON public.groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON public.groups(visibility);

-- 3. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Cluster Resources', 'Activity Resources', 'Training Materials', 'Guidelines', 'Forms', 'Reports', 'Other')),
    file_path TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT,
    mime_type TEXT,
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'coordinators', 'admins')),
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'archived')),
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_cluster_id ON public.documents(cluster_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON public.documents(visibility);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);

-- 4. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES public.clusters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'coordinators', 'admins')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_cluster_id ON public.announcements(cluster_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_visibility ON public.announcements(visibility);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements(published_at DESC);

-- Automatic published_at trigger for announcements
CREATE OR REPLACE FUNCTION public.set_announcement_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published' OR NEW.published_at IS NULL) THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_announcements_published_at ON public.announcements;
CREATE TRIGGER tr_announcements_published_at
BEFORE INSERT OR UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.set_announcement_published_at();

-- Auto timestamp triggers
DROP TRIGGER IF EXISTS tr_activities_updated_at ON public.activities;
CREATE TRIGGER tr_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_groups_updated_at ON public.groups;
CREATE TRIGGER tr_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_documents_updated_at ON public.documents;
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR CORE INFORMATION TABLES
-- ==============================================================================

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- ACTIVITIES POLICIES
-- ------------------------------------------------------------------------------

-- Public & Authenticated Read Policy:
-- - Public: status = 'published' AND visibility = 'public'
-- - Member: status = 'published' AND visibility IN ('public', 'members') in user's cluster
-- - Coordinator: + visibility = 'coordinators', or their own drafts
-- - Admin: All activities within user's cluster
-- - Super Admin: System-wide
CREATE POLICY activities_select ON public.activities
    FOR SELECT
    USING (
        public.is_super_admin()
        OR (
            (auth.uid() IS NULL)
            AND status = 'published'
            AND visibility = 'public'
        )
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                -- Cluster Admin see everything in their cluster
                public.is_admin()
                -- Creator sees their own records
                OR created_by = auth.uid()
                -- Coordinator sees approved/published or coordinator-visible
                OR (public.has_role('coordinator') AND (
                    status IN ('approved', 'published', 'pending_review') 
                    OR visibility IN ('public', 'members', 'coordinators')
                ))
                -- Members see published public & member items
                OR (
                    status = 'published' 
                    AND visibility IN ('public', 'members')
                )
            )
        )
    );

-- Activities Insert:
-- Requires activities.create permission and must match auth user's cluster
CREATE POLICY activities_insert ON public.activities
    FOR INSERT
    WITH CHECK (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND created_by = auth.uid()
            AND public.has_permission('activities.create')
            -- Ordinary users/coordinators cannot self-publish directly on insert
            AND (status IN ('draft', 'pending_review') OR public.is_admin())
        )
    );

-- Activities Update:
-- Creator can edit draft/pending_review; Admin can edit/approve/publish
CREATE POLICY activities_update ON public.activities
    FOR UPDATE
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR (created_by = auth.uid() AND status IN ('draft', 'pending_review') AND public.has_permission('activities.edit'))
            )
        )
    )
    WITH CHECK (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR (created_by = auth.uid() AND status IN ('draft', 'pending_review') AND public.has_permission('activities.edit'))
            )
        )
    );

-- Activities Delete:
-- Only Admin or Super Admin can delete/archive
CREATE POLICY activities_delete ON public.activities
    FOR DELETE
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND public.has_permission('activities.delete')
        )
    );

-- ------------------------------------------------------------------------------
-- GROUPS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY groups_select ON public.groups
    FOR SELECT
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND status = 'active'
            AND (
                public.is_admin()
                OR public.has_role('coordinator')
                OR visibility IN ('public', 'members')
            )
        )
    );

CREATE POLICY groups_manage ON public.groups
    FOR ALL
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR (public.has_permission('groups.create') AND created_by = auth.uid())
            )
        )
    )
    WITH CHECK (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR (public.has_permission('groups.create') AND created_by = auth.uid())
            )
        )
    );

-- ------------------------------------------------------------------------------
-- DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY documents_select ON public.documents
    FOR SELECT
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR uploaded_by = auth.uid()
                OR (
                    status = 'published'
                    AND (
                        visibility = 'public'
                        OR (public.has_permission('documents.view') AND visibility = 'members')
                        OR (public.has_role('coordinator') AND visibility = 'coordinators')
                    )
                )
            )
        )
    );

CREATE POLICY documents_insert ON public.documents
    FOR INSERT
    WITH CHECK (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND uploaded_by = auth.uid()
            AND public.has_permission('documents.upload')
            AND (status IN ('draft', 'pending_review') OR public.is_admin())
        )
    );

CREATE POLICY documents_update ON public.documents
    FOR UPDATE
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR (uploaded_by = auth.uid() AND status IN ('draft', 'pending_review'))
            )
        )
    );

CREATE POLICY documents_delete ON public.documents
    FOR DELETE
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND public.has_permission('documents.delete')
        )
    );

-- ------------------------------------------------------------------------------
-- ANNOUNCEMENTS POLICIES
-- ------------------------------------------------------------------------------

CREATE POLICY announcements_select ON public.announcements
    FOR SELECT
    USING (
        public.is_super_admin()
        OR (
            (auth.uid() IS NULL)
            AND status = 'published'
            AND visibility = 'public'
        )
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR created_by = auth.uid()
                OR (
                    status = 'published'
                    AND (
                        visibility = 'public'
                        OR (visibility = 'members' AND public.has_permission('announcements.view'))
                    )
                )
            )
        )
    );

CREATE POLICY announcements_insert ON public.announcements
    FOR INSERT
    WITH CHECK (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND created_by = auth.uid()
            AND public.has_permission('announcements.create')
            AND (status IN ('draft', 'pending_review') OR public.is_admin())
        )
    );

CREATE POLICY announcements_update ON public.announcements
    FOR UPDATE
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND (
                public.is_admin()
                OR (created_by = auth.uid() AND status IN ('draft', 'pending_review'))
            )
        )
    );

CREATE POLICY announcements_delete ON public.announcements
    FOR DELETE
    USING (
        public.is_super_admin()
        OR (
            cluster_id = public.get_auth_user_cluster()
            AND public.has_permission('announcements.delete')
        )
    );

-- ==============================================================================
-- SUPABASE STORAGE SECURITY POLICIES (bucket: 'cluster-documents')
-- ==============================================================================

-- Ensure bucket exists (Private bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cluster-documents', 
    'cluster-documents', 
    false, 
    20971520, -- 20 MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage Download Policy:
-- Verifies user is authenticated, file belongs to their cluster, and document record is authorized
CREATE POLICY storage_documents_download ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'cluster-documents'
        AND EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.file_path = name
              AND (
                  public.is_super_admin()
                  OR (
                      d.cluster_id = public.get_auth_user_cluster()
                      AND (
                          public.is_admin()
                          OR d.uploaded_by = auth.uid()
                          OR (
                              d.status = 'published'
                              AND (
                                  d.visibility = 'public'
                                  OR (public.has_permission('documents.view') AND d.visibility = 'members')
                                  OR (public.has_role('coordinator') AND d.visibility = 'coordinators')
                              )
                          )
                      )
                  )
              )
        )
    );

-- Storage Upload Policy:
-- Authorized users with 'documents.upload' can upload to their cluster's folder
CREATE POLICY storage_documents_upload ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'cluster-documents'
        AND public.has_permission('documents.upload')
        AND (name LIKE (public.get_auth_user_cluster()::text || '/%') OR public.is_super_admin())
    );
