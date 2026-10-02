-- ==============================================================================
-- KIMANA CLUSTER PORTAL - PHASE 2 SEED DATA
-- Fictional Demonstration Data for Activities, Groups, Documents, Announcements
-- ==============================================================================

-- 1. SEED ACTIVITIES
INSERT INTO public.activities (
    id, cluster_id, locality_id, title, description, activity_type,
    start_time, end_time, location, visibility, status, created_by
)
VALUES
    (
        'act-101', 'c1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111',
        'Kimana Central Community Devotional Gathering',
        'Weekly community devotional meeting with readings, prayers, and fellowship for families and visitors.',
        'Devotional Meeting',
        '2026-10-10 16:00:00+03', '2026-10-10 17:30:00+03',
        'Kimana Central Community Center, Room 2',
        'public', 'published', 'usr-coord'
    ),
    (
        'act-102', 'c1111111-1111-1111-1111-111111111111', 'l2222222-2222-2222-2222-222222222222',
        'Isinet Junior Youth Mentorship Gathering',
        'Weekly gathering focusing on moral empowerment, service project planning, and mutual study for youth aged 12-15.',
        'Junior Youth Group',
        '2026-10-11 10:00:00+03', '2026-10-11 12:00:00+03',
        'Isinet Shade Tree / Agricultural Hub',
        'members', 'published', 'usr-coord'
    ),
    (
        'act-103', 'c1111111-1111-1111-1111-111111111111', 'l3333333-3333-3333-3333-333333333333',
        'Namelok Children’s Spiritual Education Class',
        'Grade 1 and 2 moral education classes focusing on virtues such as truthfulness, unity, and kindness.',
        'Children’s Class',
        '2026-10-17 09:30:00+03', '2026-10-17 11:00:00+03',
        'Namelok Primary School Grounds',
        'members', 'published', 'usr-coord'
    ),
    (
        'act-104', 'c1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111',
        'Reflections on the Life of the Spirit - Study Circle',
        'Collective inquiry and study of Book 1, focusing on understanding spiritual reality and cultivating prayerful habits.',
        'Study Circle',
        '2026-10-18 14:00:00+03', '2026-10-18 16:00:00+03',
        'Kimana Central Community Hall',
        'members', 'published', 'usr-member'
    ),
    (
        'act-105', 'c1111111-1111-1111-1111-111111111111', 'l4444444-4444-4444-4444-444444444444',
        'Tikondo Quarterly Cluster Reflection Gathering',
        'Cluster-wide consultation on educational activities, growth, and community service projects.',
        'Consultation',
        '2026-10-24 09:00:00+03', '2026-10-24 13:00:00+03',
        'Tikondo Community Hall',
        'public', 'published', 'usr-admin'
    ),
    (
        'act-106', 'c1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111',
        'Cluster Coordinators Planning & Assessment Meeting',
        'Coordination review meeting for active tutors, animators, and children’s class teachers.',
        'Coordinators Meeting',
        '2026-10-25 15:00:00+03', '2026-10-25 17:00:00+03',
        'Kimana Administration Office',
        'coordinators', 'published', 'usr-coord'
    ),
    (
        'act-107', 'c1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111',
        'Internal Cluster Administrative Review (Draft)',
        'Private administrative assembly to review institutional reports and security settings.',
        'Administration',
        '2026-10-28 10:00:00+03', '2026-10-28 12:00:00+03',
        'Kimana Admin Annex',
        'admins', 'draft', 'usr-admin'
    ),
    -- Secondary Cluster B Activity for cross-cluster isolation testing
    (
        'act-999', 'c2222222-2222-2222-2222-222222222222', 'l9999999-9999-9999-9999-999999999999',
        'Amboseli Border Gathering (Cluster B Restricted)',
        'Strictly isolated activity belonging to Amboseli Border Cluster.',
        'Devotional Meeting',
        '2026-10-15 14:00:00+03', '2026-10-15 16:00:00+03',
        'Amboseli Border Post Hall',
        'members', 'published', 'usr-superadmin'
    )
ON CONFLICT (id) DO NOTHING;

-- 2. SEED GROUPS
INSERT INTO public.groups (
    id, cluster_id, locality_id, name, group_type, description,
    meeting_day, meeting_time, location, visibility, status, created_by
)
VALUES
    (
        'grp-201', 'c1111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111',
        'Kimana Central Book 1 Study Circle',
        'Study Circle',
        'Studying Reflections on the Life of the Spirit with facilitator and 7 participants.',
        'Sunday', '14:00 - 16:00', 'Kimana Central Community Center',
        'members', 'active', 'usr-coord'
    ),
    (
        'grp-202', 'c1111111-1111-1111-1111-111111111111', 'l2222222-2222-2222-2222-222222222222',
        'Isinet Junior Youth Group - Pioneers',
        'Junior Youth Group',
        'Group of 12 junior youth studying Breezes of Confirmation and undertaking community tree planting.',
        'Saturday', '10:00 - 12:00', 'Isinet Locality Center',
        'members', 'active', 'usr-coord'
    ),
    (
        'grp-203', 'c1111111-1111-1111-1111-111111111111', 'l3333333-3333-3333-3333-333333333333',
        'Namelok Children’s Spiritual Education Class',
        'Children''s Class',
        'Classes for neighborhood children aged 6 to 9 fostering spiritual qualities and community arts.',
        'Saturday', '09:00 - 10:30', 'Namelok Springs Hall',
        'members', 'active', 'usr-coord'
    ),
    (
        'grp-204', 'c1111111-1111-1111-1111-111111111111', 'l4444444-4444-4444-4444-444444444444',
        'Tikondo Neighborhood Devotional Group',
        'Devotional Meeting',
        'Bi-weekly neighborhood devotional gathering in homes in Tikondo locality.',
        'Wednesday', '18:00 - 19:30', 'Rotational Family Homes',
        'members', 'active', 'usr-member'
    ),
    -- Cluster B Group (for cross-cluster isolation testing)
    (
        'grp-999', 'c2222222-2222-2222-2222-222222222222', 'l9999999-9999-9999-9999-999999999999',
        'Amboseli Border Youth Group (Cluster B Only)',
        'Junior Youth Group',
        'Strictly isolated group belonging to Cluster B.',
        'Friday', '15:00 - 17:00', 'Amboseli Gate',
        'members', 'active', 'usr-superadmin'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. SEED DOCUMENTS
INSERT INTO public.documents (
    id, cluster_id, title, description, category, file_path,
    file_name, file_size, mime_type, visibility, status, uploaded_by
)
VALUES
    (
        'doc-301', 'c1111111-1111-1111-1111-111111111111',
        'Kimana Cluster Portal Orientation & Welcome Guide',
        'Introduction for verified community members on accessing approved resources and schedules.',
        'Cluster Resources', 'c1111111-1111-1111-1111-111111111111/orientation_guide_2026.pdf',
        'orientation_guide_2026.pdf', 524288, 'application/pdf',
        'public', 'published', 'usr-admin'
    ),
    (
        'doc-302', 'c1111111-1111-1111-1111-111111111111',
        'Guidelines for Community Devotional Gatherings',
        'Best practices for organizing and facilitating inclusive, spirit-building devotional meetings.',
        'Guidelines', 'c1111111-1111-1111-1111-111111111111/devotional_guidelines.pdf',
        'devotional_guidelines.pdf', 314572, 'application/pdf',
        'members', 'published', 'usr-coord'
    ),
    (
        'doc-303', 'c1111111-1111-1111-1111-111111111111',
        'Junior Youth Animator Training Syllabus',
        'Core curriculum and educational milestones for facilitators of junior youth empowerment groups.',
        'Training Materials', 'c1111111-1111-1111-1111-111111111111/junior_youth_training.pdf',
        'junior_youth_training.pdf', 1048576, 'application/pdf',
        'members', 'published', 'usr-coord'
    ),
    (
        'doc-304', 'c1111111-1111-1111-1111-111111111111',
        'Activity Attendance & Participation Log Sheet',
        'Standard printable recording form for study circles and educational classes.',
        'Forms', 'c1111111-1111-1111-1111-111111111111/activity_log_form.pdf',
        'activity_log_form.pdf', 157286, 'application/pdf',
        'coordinators', 'published', 'usr-coord'
    ),
    (
        'doc-305', 'c1111111-1111-1111-1111-111111111111',
        'Confidential Administrative Audit Review 2026 (Admins Only)',
        'Internal administrative review and security audits for Kimana Cluster administration.',
        'Reports', 'c1111111-1111-1111-1111-111111111111/confidential_audit_2026.pdf',
        'confidential_audit_2026.pdf', 786432, 'application/pdf',
        'admins', 'draft', 'usr-admin'
    ),
    -- Cluster B Document (for cross-cluster isolation testing)
    (
        'doc-999', 'c2222222-2222-2222-2222-222222222222',
        'Amboseli Border Cluster Internal Strategy (Cluster B Only)',
        'Protected document belonging exclusively to Cluster B.',
        'Reports', 'c2222222-2222-2222-2222-222222222222/amboseli_internal.pdf',
        'amboseli_internal.pdf', 419430, 'application/pdf',
        'members', 'published', 'usr-superadmin'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED ANNOUNCEMENTS
INSERT INTO public.announcements (
    id, cluster_id, title, content, visibility, status, published_at, created_by
)
VALUES
    (
        'ann-401', 'c1111111-1111-1111-1111-111111111111',
        'Official Launch of the Kimana Cluster Portal',
        'We welcome all community members to the Kimana Cluster Portal, an approved central platform designed to provide secure, accurate access to cluster schedules, devotional meetings, study circles, and educational resources without delay.',
        'public', 'published', '2026-10-01 08:00:00+03', 'usr-admin'
    ),
    (
        'ann-402', 'c1111111-1111-1111-1111-111111111111',
        'New Book 1 Study Circles Commencing in Namelok and Isinet',
        'Two new study circles on Reflections on the Life of the Spirit will commence in mid-October. Verified members in Namelok and Isinet can view meeting times and locations in the Activities section.',
        'members', 'published', '2026-10-02 09:30:00+03', 'usr-coord'
    ),
    (
        'ann-403', 'c1111111-1111-1111-1111-111111111111',
        'Updated Training Guidelines for Children’s Class Teachers',
        'The educational coordinating team has released updated virtue lesson plans and craft guidelines in the Documents library. Teachers are encouraged to download and review the materials.',
        'members', 'published', '2026-10-02 11:15:00+03', 'usr-coord'
    ),
    (
        'ann-404', 'c1111111-1111-1111-1111-111111111111',
        'Draft Internal Notice on Administrative Localities Review (Draft)',
        'Coordinators and administrators will review locality boundaries during the upcoming institutional meeting.',
        'admins', 'draft', NULL, 'usr-admin'
    ),
    -- Cluster B Announcement (for cross-cluster isolation testing)
    (
        'ann-999', 'c2222222-2222-2222-2222-222222222222',
        'Amboseli Border Cluster Announcement (Cluster B)',
        'Strictly isolated announcement belonging exclusively to Cluster B.',
        'members', 'published', '2026-10-01 10:00:00+03', 'usr-superadmin'
    )
ON CONFLICT (id) DO NOTHING;
