import {
  AccessRequest,
  Activity,
  Announcement,
  Cluster,
  DocumentCategory,
  DocumentItem,
  Group,
  Locality,
  Profile,
  RoleType,
  SearchResultItem,
  UserRoleRecord,
  UserStatus,
} from '../types';
import { recordAuditLog, getStoredAuditLogs } from './audit';
import {
  canAccessCluster,
  canApproveActivity,
  canApproveDocument,
  canAssignRole,
  canCreateActivity,
  canCreateAnnouncement,
  canCreateGroup,
  canDeleteActivity,
  canDeleteDocument,
  canEditActivity,
  canEditGroup,
  canPublishActivity,
  canPublishAnnouncement,
  canUploadDocument,
  canViewActivity,
  canViewAnnouncement,
  canViewDocument,
  canViewGroup,
  hasPermission,
} from './permissions';

// Storage keys
const STORAGE_PREFIX = 'kimana_portal_';
const KEYS = {
  CLUSTERS: `${STORAGE_PREFIX}clusters`,
  LOCALITIES: `${STORAGE_PREFIX}localities`,
  PROFILES: `${STORAGE_PREFIX}profiles`,
  USER_ROLES: `${STORAGE_PREFIX}user_roles`,
  ACCESS_REQUESTS: `${STORAGE_PREFIX}access_requests`,
  ACTIVITIES: `${STORAGE_PREFIX}activities_v2`,
  GROUPS: `${STORAGE_PREFIX}groups_v2`,
  DOCUMENTS: `${STORAGE_PREFIX}documents_v2`,
  ANNOUNCEMENTS: `${STORAGE_PREFIX}announcements_v2`,
};

// Default Seed Constants
export const PRIMARY_CLUSTER_ID = 'c1111111-1111-1111-1111-111111111111';
export const SECONDARY_CLUSTER_ID = 'c2222222-2222-2222-2222-222222222222';

const SEED_CLUSTERS: Cluster[] = [
  {
    id: PRIMARY_CLUSTER_ID,
    name: 'Kimana Cluster',
    description: 'Central information and coordination cluster serving Kimana, Namelok, Isinet, and Tikondo.',
    region: 'Kajiado South',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: SECONDARY_CLUSTER_ID,
    name: 'Amboseli Border Cluster',
    description: 'Secondary demonstration cluster for multi-cluster authorization and boundary verification.',
    region: 'Amboseli Basin',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
];

const SEED_LOCALITIES: Locality[] = [
  {
    id: 'loc-central',
    cluster_id: PRIMARY_CLUSTER_ID,
    name: 'Kimana Central',
    description: 'Town center, market hub, and central gathering hall.',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'loc-isinet',
    cluster_id: PRIMARY_CLUSTER_ID,
    name: 'Isinet Locality',
    description: 'Northern agricultural sector and junior youth coordination point.',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'loc-namelok',
    cluster_id: PRIMARY_CLUSTER_ID,
    name: 'Namelok Locality',
    description: 'Springs community, cultural study circles, and youth mentoring.',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'loc-tikondo',
    cluster_id: PRIMARY_CLUSTER_ID,
    name: 'Tikondo Locality',
    description: 'Western pastoral area and community devotional clusters.',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  // Locality strictly in Cluster B
  {
    id: 'loc-border',
    cluster_id: SECONDARY_CLUSTER_ID,
    name: 'Amboseli Gate Locality',
    description: 'Protected locality in Secondary Cluster B.',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
];

export const DEMO_USERS: Array<{
  profile: Profile;
  role: RoleType;
  passwordHint: string;
}> = [
  {
    profile: {
      id: 'usr-superadmin',
      full_name: 'Dr. Tariq Mwalimu',
      email: 'superadmin@kimanaportal.org',
      phone: '+254 711 000 001',
      cluster_id: PRIMARY_CLUSTER_ID,
      locality_id: 'loc-central',
      status: 'active',
      created_at: new Date('2026-01-01').toISOString(),
      updated_at: new Date('2026-01-01').toISOString(),
    },
    role: 'super_admin',
    passwordHint: 'superadmin123',
  },
  {
    profile: {
      id: 'usr-admin',
      full_name: 'Amina Naserian',
      email: 'admin@kimanaportal.org',
      phone: '+254 722 000 002',
      cluster_id: PRIMARY_CLUSTER_ID,
      locality_id: 'loc-central',
      status: 'active',
      created_at: new Date('2026-01-05').toISOString(),
      updated_at: new Date('2026-01-05').toISOString(),
    },
    role: 'cluster_admin',
    passwordHint: 'admin123',
  },
  {
    profile: {
      id: 'usr-coord',
      full_name: 'Joseph Kiprotich',
      email: 'coordinator@kimanaportal.org',
      phone: '+254 733 000 003',
      cluster_id: PRIMARY_CLUSTER_ID,
      locality_id: 'loc-isinet',
      status: 'active',
      created_at: new Date('2026-01-10').toISOString(),
      updated_at: new Date('2026-01-10').toISOString(),
    },
    role: 'coordinator',
    passwordHint: 'coordinator123',
  },
  {
    profile: {
      id: 'usr-member',
      full_name: 'Faith Sianoi',
      email: 'member@kimanaportal.org',
      phone: '+254 744 000 004',
      cluster_id: PRIMARY_CLUSTER_ID,
      locality_id: 'loc-namelok',
      status: 'active',
      created_at: new Date('2026-01-15').toISOString(),
      updated_at: new Date('2026-01-15').toISOString(),
    },
    role: 'member',
    passwordHint: 'member123',
  },
  {
    profile: {
      id: 'usr-pending',
      full_name: 'David Omondi',
      email: 'applicant@kimanaportal.org',
      phone: '+254 755 000 005',
      cluster_id: PRIMARY_CLUSTER_ID,
      locality_id: 'loc-central',
      status: 'pending',
      created_at: new Date('2026-02-01').toISOString(),
      updated_at: new Date('2026-02-01').toISOString(),
    },
    role: 'public',
    passwordHint: 'applicant123',
  },
];

const SEED_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'req-001',
    cluster_id: PRIMARY_CLUSTER_ID,
    full_name: 'David Omondi',
    email: 'applicant@kimanaportal.org',
    phone: '+254 755 000 005',
    locality_id: 'loc-central',
    reason: 'Resident of Kimana Central for 4 years. Requesting access to join devotional gatherings and community study circles.',
    status: 'pending',
    created_at: new Date('2026-02-01T08:30:00Z').toISOString(),
    updated_at: new Date('2026-02-01T08:30:00Z').toISOString(),
  },
  {
    id: 'req-002',
    cluster_id: PRIMARY_CLUSTER_ID,
    full_name: 'Beatrice Nashipae',
    email: 'beatrice.nashipae@example.com',
    phone: '+254 788 123 456',
    locality_id: 'loc-isinet',
    reason: 'Volunteer educator in Isinet requesting access to cluster educational materials and activity schedule.',
    status: 'pending',
    created_at: new Date('2026-02-03T11:15:00Z').toISOString(),
    updated_at: new Date('2026-02-03T11:15:00Z').toISOString(),
  },
];

// ==============================================================================
// PHASE 2 SEED DATA
// ==============================================================================

const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'act-101',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-central',
    title: 'Kimana Central Community Devotional Gathering',
    description: 'Weekly community devotional meeting with readings, prayers, and fellowship for families and visitors.',
    activity_type: 'Devotional Meeting',
    start_time: '2026-10-10T16:00:00.000Z',
    end_time: '2026-10-10T17:30:00.000Z',
    location: 'Kimana Central Community Center, Room 2',
    visibility: 'public',
    status: 'published',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-09-25T10:00:00.000Z',
    updated_at: '2026-09-25T10:00:00.000Z',
  },
  {
    id: 'act-102',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-isinet',
    title: 'Isinet Junior Youth Mentorship Gathering',
    description: 'Weekly gathering focusing on moral empowerment, service project planning, and mutual study for youth aged 12-15.',
    activity_type: 'Junior Youth Group',
    start_time: '2026-10-11T10:00:00.000Z',
    end_time: '2026-10-11T12:00:00.000Z',
    location: 'Isinet Shade Tree / Agricultural Hub',
    visibility: 'members',
    status: 'published',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-09-26T11:00:00.000Z',
    updated_at: '2026-09-26T11:00:00.000Z',
  },
  {
    id: 'act-103',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-namelok',
    title: 'Namelok Children’s Spiritual Education Class',
    description: 'Grade 1 and 2 moral education classes focusing on virtues such as truthfulness, unity, and kindness.',
    activity_type: "Children's Class",
    start_time: '2026-10-17T09:30:00.000Z',
    end_time: '2026-10-17T11:00:00.000Z',
    location: 'Namelok Primary School Grounds',
    visibility: 'members',
    status: 'published',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-09-27T08:00:00.000Z',
    updated_at: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'act-104',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-central',
    title: 'Reflections on the Life of the Spirit - Study Circle',
    description: 'Collective inquiry and study of Book 1, focusing on understanding spiritual reality and cultivating prayerful habits.',
    activity_type: 'Study Circle',
    start_time: '2026-10-18T14:00:00.000Z',
    end_time: '2026-10-18T16:00:00.000Z',
    location: 'Kimana Central Community Hall',
    visibility: 'members',
    status: 'published',
    created_by: 'usr-member',
    creator_name: 'Faith Sianoi',
    created_at: '2026-09-28T14:00:00.000Z',
    updated_at: '2026-09-28T14:00:00.000Z',
  },
  {
    id: 'act-105',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-tikondo',
    title: 'Tikondo Quarterly Cluster Reflection Gathering',
    description: 'Cluster-wide consultation on educational activities, growth, and community service projects.',
    activity_type: 'Consultation',
    start_time: '2026-10-24T09:00:00.000Z',
    end_time: '2026-10-24T13:00:00.000Z',
    location: 'Tikondo Community Hall',
    visibility: 'public',
    status: 'published',
    created_by: 'usr-admin',
    creator_name: 'Amina Naserian',
    created_at: '2026-09-29T10:00:00.000Z',
    updated_at: '2026-09-29T10:00:00.000Z',
  },
  {
    id: 'act-106',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-central',
    title: 'Cluster Coordinators Planning & Assessment Meeting',
    description: 'Coordination review meeting for active tutors, animators, and children’s class teachers.',
    activity_type: 'Coordinators Meeting',
    start_time: '2026-10-25T15:00:00.000Z',
    end_time: '2026-10-25T17:00:00.000Z',
    location: 'Kimana Administration Office',
    visibility: 'coordinators',
    status: 'published',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-09-30T15:00:00.000Z',
    updated_at: '2026-09-30T15:00:00.000Z',
  },
  {
    id: 'act-107',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-central',
    title: 'Internal Cluster Administrative Review (Draft)',
    description: 'Private administrative assembly to review institutional reports and security settings.',
    activity_type: 'Administration',
    start_time: '2026-10-28T10:00:00.000Z',
    end_time: '2026-10-28T12:00:00.000Z',
    location: 'Kimana Admin Annex',
    visibility: 'admins',
    status: 'draft',
    created_by: 'usr-admin',
    creator_name: 'Amina Naserian',
    created_at: '2026-10-01T09:00:00.000Z',
    updated_at: '2026-10-01T09:00:00.000Z',
  },
  // Secondary Cluster B Activity for cross-cluster isolation testing
  {
    id: 'act-999',
    cluster_id: SECONDARY_CLUSTER_ID,
    locality_id: 'loc-border',
    title: 'Amboseli Border Gathering (Cluster B Restricted)',
    description: 'Strictly isolated activity belonging to Amboseli Border Cluster.',
    activity_type: 'Devotional Meeting',
    start_time: '2026-10-15T14:00:00.000Z',
    end_time: '2026-10-15T16:00:00.000Z',
    location: 'Amboseli Border Post Hall',
    visibility: 'members',
    status: 'published',
    created_by: 'usr-superadmin',
    creator_name: 'Dr. Tariq Mwalimu',
    created_at: '2026-09-20T10:00:00.000Z',
    updated_at: '2026-09-20T10:00:00.000Z',
  },
];

const SEED_GROUPS: Group[] = [
  {
    id: 'grp-201',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-central',
    name: 'Kimana Central Book 1 Study Circle',
    group_type: 'Study Circle',
    description: 'Studying Reflections on the Life of the Spirit with facilitator and 7 participants.',
    meeting_day: 'Sunday',
    meeting_time: '14:00 - 16:00',
    location: 'Kimana Central Community Center',
    visibility: 'members',
    status: 'active',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'grp-202',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-isinet',
    name: 'Isinet Junior Youth Group - Pioneers',
    group_type: 'Junior Youth Group',
    description: 'Group of 12 junior youth studying Breezes of Confirmation and undertaking community tree planting.',
    meeting_day: 'Saturday',
    meeting_time: '10:00 - 12:00',
    location: 'Isinet Locality Center',
    visibility: 'members',
    status: 'active',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-09-02T10:00:00.000Z',
    updated_at: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'grp-203',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-namelok',
    name: 'Namelok Children’s Spiritual Education Class',
    group_type: "Children's Class",
    description: 'Classes for neighborhood children aged 6 to 9 fostering spiritual qualities and community arts.',
    meeting_day: 'Saturday',
    meeting_time: '09:00 - 10:30',
    location: 'Namelok Springs Hall',
    visibility: 'members',
    status: 'active',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-09-03T10:00:00.000Z',
    updated_at: '2026-09-03T10:00:00.000Z',
  },
  {
    id: 'grp-204',
    cluster_id: PRIMARY_CLUSTER_ID,
    locality_id: 'loc-tikondo',
    name: 'Tikondo Neighborhood Devotional Group',
    group_type: 'Devotional Meeting',
    description: 'Bi-weekly neighborhood devotional gathering in homes in Tikondo locality.',
    meeting_day: 'Wednesday',
    meeting_time: '18:00 - 19:30',
    location: 'Rotational Family Homes',
    visibility: 'members',
    status: 'active',
    created_by: 'usr-member',
    creator_name: 'Faith Sianoi',
    created_at: '2026-09-04T10:00:00.000Z',
    updated_at: '2026-09-04T10:00:00.000Z',
  },
  // Cluster B Group (for cross-cluster isolation testing)
  {
    id: 'grp-999',
    cluster_id: SECONDARY_CLUSTER_ID,
    locality_id: 'loc-border',
    name: 'Amboseli Border Youth Group (Cluster B Only)',
    group_type: 'Junior Youth Group',
    description: 'Strictly isolated group belonging to Cluster B.',
    meeting_day: 'Friday',
    meeting_time: '15:00 - 17:00',
    location: 'Amboseli Gate',
    visibility: 'members',
    status: 'active',
    created_by: 'usr-superadmin',
    creator_name: 'Dr. Tariq Mwalimu',
    created_at: '2026-09-05T10:00:00.000Z',
    updated_at: '2026-09-05T10:00:00.000Z',
  },
];

const SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-301',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Kimana Cluster Portal Orientation & Welcome Guide',
    description: 'Introduction for verified community members on accessing approved resources and schedules.',
    category: 'Cluster Resources',
    file_path: 'c1111111-1111-1111-1111-111111111111/orientation_guide_2026.pdf',
    file_name: 'orientation_guide_2026.pdf',
    file_size: 524288,
    mime_type: 'application/pdf',
    visibility: 'public',
    status: 'published',
    uploaded_by: 'usr-admin',
    uploader_name: 'Amina Naserian',
    created_at: '2026-09-10T10:00:00.000Z',
    updated_at: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'doc-302',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Guidelines for Community Devotional Gatherings',
    description: 'Best practices for organizing and facilitating inclusive, spirit-building devotional meetings.',
    category: 'Guidelines',
    file_path: 'c1111111-1111-1111-1111-111111111111/devotional_guidelines.pdf',
    file_name: 'devotional_guidelines.pdf',
    file_size: 314572,
    mime_type: 'application/pdf',
    visibility: 'members',
    status: 'published',
    uploaded_by: 'usr-coord',
    uploader_name: 'Joseph Kiprotich',
    created_at: '2026-09-12T10:00:00.000Z',
    updated_at: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 'doc-303',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Junior Youth Animator Training Syllabus',
    description: 'Core curriculum and educational milestones for facilitators of junior youth empowerment groups.',
    category: 'Training Materials',
    file_path: 'c1111111-1111-1111-1111-111111111111/junior_youth_training.pdf',
    file_name: 'junior_youth_training.pdf',
    file_size: 1048576,
    mime_type: 'application/pdf',
    visibility: 'members',
    status: 'published',
    uploaded_by: 'usr-coord',
    uploader_name: 'Joseph Kiprotich',
    created_at: '2026-09-15T10:00:00.000Z',
    updated_at: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'doc-304',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Activity Attendance & Participation Log Sheet',
    description: 'Standard printable recording form for study circles and educational classes.',
    category: 'Forms',
    file_path: 'c1111111-1111-1111-1111-111111111111/activity_log_form.pdf',
    file_name: 'activity_log_form.pdf',
    file_size: 157286,
    mime_type: 'application/pdf',
    visibility: 'coordinators',
    status: 'published',
    uploaded_by: 'usr-coord',
    uploader_name: 'Joseph Kiprotich',
    created_at: '2026-09-18T10:00:00.000Z',
    updated_at: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'doc-305',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Confidential Administrative Audit Review 2026 (Admins Only)',
    description: 'Internal administrative review and security audits for Kimana Cluster administration.',
    category: 'Reports',
    file_path: 'c1111111-1111-1111-1111-111111111111/confidential_audit_2026.pdf',
    file_name: 'confidential_audit_2026.pdf',
    file_size: 786432,
    mime_type: 'application/pdf',
    visibility: 'admins',
    status: 'draft',
    uploaded_by: 'usr-admin',
    uploader_name: 'Amina Naserian',
    created_at: '2026-09-20T10:00:00.000Z',
    updated_at: '2026-09-20T10:00:00.000Z',
  },
  // Cluster B Document (for cross-cluster isolation testing)
  {
    id: 'doc-999',
    cluster_id: SECONDARY_CLUSTER_ID,
    title: 'Amboseli Border Cluster Internal Strategy (Cluster B Only)',
    description: 'Protected document belonging exclusively to Cluster B.',
    category: 'Reports',
    file_path: 'c2222222-2222-2222-2222-222222222222/amboseli_internal.pdf',
    file_name: 'amboseli_internal.pdf',
    file_size: 419430,
    mime_type: 'application/pdf',
    visibility: 'members',
    status: 'published',
    uploaded_by: 'usr-superadmin',
    uploader_name: 'Dr. Tariq Mwalimu',
    created_at: '2026-09-22T10:00:00.000Z',
    updated_at: '2026-09-22T10:00:00.000Z',
  },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-401',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Official Launch of the Kimana Cluster Portal',
    content: 'We welcome all community members to the Kimana Cluster Portal, an approved central platform designed to provide secure, accurate access to cluster schedules, devotional meetings, study circles, and educational resources without delay.',
    visibility: 'public',
    status: 'published',
    published_at: '2026-10-01T08:00:00.000Z',
    created_by: 'usr-admin',
    creator_name: 'Amina Naserian',
    created_at: '2026-10-01T08:00:00.000Z',
    updated_at: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'ann-402',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'New Book 1 Study Circles Commencing in Namelok and Isinet',
    content: 'Two new study circles on Reflections on the Life of the Spirit will commence in mid-October. Verified members in Namelok and Isinet can view meeting times and locations in the Activities section.',
    visibility: 'members',
    status: 'published',
    published_at: '2026-10-02T09:30:00.000Z',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-10-02T09:30:00.000Z',
    updated_at: '2026-10-02T09:30:00.000Z',
  },
  {
    id: 'ann-403',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Updated Training Guidelines for Children’s Class Teachers',
    content: 'The educational coordinating team has released updated virtue lesson plans and craft guidelines in the Documents library. Teachers are encouraged to download and review the materials.',
    visibility: 'members',
    status: 'published',
    published_at: '2026-10-02T11:15:00.000Z',
    created_by: 'usr-coord',
    creator_name: 'Joseph Kiprotich',
    created_at: '2026-10-02T11:15:00.000Z',
    updated_at: '2026-10-02T11:15:00.000Z',
  },
  {
    id: 'ann-404',
    cluster_id: PRIMARY_CLUSTER_ID,
    title: 'Draft Internal Notice on Administrative Localities Review (Draft)',
    content: 'Coordinators and administrators will review locality boundaries during the upcoming institutional meeting.',
    visibility: 'admins',
    status: 'draft',
    created_by: 'usr-admin',
    creator_name: 'Amina Naserian',
    created_at: '2026-10-01T09:00:00.000Z',
    updated_at: '2026-10-01T09:00:00.000Z',
  },
  // Cluster B Announcement (for cross-cluster isolation testing)
  {
    id: 'ann-999',
    cluster_id: SECONDARY_CLUSTER_ID,
    title: 'Amboseli Border Cluster Announcement (Cluster B)',
    content: 'Strictly isolated announcement belonging exclusively to Cluster B.',
    visibility: 'members',
    status: 'published',
    published_at: '2026-10-01T10:00:00.000Z',
    created_by: 'usr-superadmin',
    creator_name: 'Dr. Tariq Mwalimu',
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-01T10:00:00.000Z',
  },
];

// Database storage helper
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage error for', key, err);
  }
}

/**
 * Initialize Database Tables and Seeds
 */
export function initializeDatabase(): void {
  // Clusters
  getStored<Cluster[]>(KEYS.CLUSTERS, SEED_CLUSTERS);
  // Localities
  getStored<Locality[]>(KEYS.LOCALITIES, SEED_LOCALITIES);
  // Profiles
  const profiles = DEMO_USERS.map((u) => u.profile);
  getStored<Profile[]>(KEYS.PROFILES, profiles);
  // User Roles
  const userRoles: UserRoleRecord[] = DEMO_USERS.map((u) => ({
    id: `ur-${u.profile.id}`,
    user_id: u.profile.id,
    role_id: u.role,
    cluster_id: u.profile.cluster_id,
    assigned_at: u.profile.created_at,
  }));
  getStored<UserRoleRecord[]>(KEYS.USER_ROLES, userRoles);
  // Access Requests
  getStored<AccessRequest[]>(KEYS.ACCESS_REQUESTS, SEED_ACCESS_REQUESTS);
  // Phase 2 Entities
  getStored<Activity[]>(KEYS.ACTIVITIES, SEED_ACTIVITIES);
  getStored<Group[]>(KEYS.GROUPS, SEED_GROUPS);
  getStored<DocumentItem[]>(KEYS.DOCUMENTS, SEED_DOCUMENTS);
  getStored<Announcement[]>(KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
}

// Ensure database is initialized on import
initializeDatabase();

// ============================================================================
// DATA ACCESS FUNCTIONS WITH POSTGRESQL RLS ENFORCEMENT
// ============================================================================

/**
 * RLS: getClusters
 */
export function getClusters(actorRole: RoleType = 'public'): Cluster[] {
  const clusters = getStored<Cluster[]>(KEYS.CLUSTERS, SEED_CLUSTERS);
  if (actorRole === 'super_admin') return clusters;
  return clusters.filter((c) => c.status === 'active');
}

/**
 * RLS: getLocalities
 */
export function getLocalities(
  clusterId: string,
  userProfile?: Profile,
  actorRole: RoleType = 'public'
): Locality[] {
  if (userProfile && !canAccessCluster(userProfile.cluster_id, clusterId, actorRole)) {
    return [];
  }
  const localities = getStored<Locality[]>(KEYS.LOCALITIES, SEED_LOCALITIES);
  return localities.filter((loc) => loc.cluster_id === clusterId && loc.status === 'active');
}

/**
 * RLS: getProfiles
 */
export function getProfiles(
  actorProfile: Profile | null,
  actorRole: RoleType
): Profile[] {
  const allProfiles = getStored<Profile[]>(KEYS.PROFILES, []);
  if (!actorProfile) return [];

  if (actorRole === 'super_admin') {
    return allProfiles;
  }

  if (actorRole === 'cluster_admin' || actorRole === 'coordinator') {
    return allProfiles.filter((p) => p.cluster_id === actorProfile.cluster_id);
  }

  return allProfiles.filter((p) => p.id === actorProfile.id);
}

/**
 * Get User Role
 */
export function getUserRole(userId: string): RoleType {
  const userRoles = getStored<UserRoleRecord[]>(KEYS.USER_ROLES, []);
  const record = userRoles.find((r) => r.user_id === userId);
  return record ? record.role_id : 'public';
}

/**
 * RLS: getAccessRequests
 */
export function getAccessRequests(
  actorProfile: Profile | null,
  actorRole: RoleType
): AccessRequest[] {
  if (!actorProfile || (actorRole !== 'cluster_admin' && actorRole !== 'super_admin')) {
    throw new Error('ACCESS_DENIED: You do not have permission to view access requests.');
  }

  const allRequests = getStored<AccessRequest[]>(KEYS.ACCESS_REQUESTS, []);
  if (actorRole === 'super_admin') {
    return allRequests;
  }

  return allRequests.filter((r) => r.cluster_id === actorProfile.cluster_id);
}

/**
 * Submit a new Access Request
 */
export async function submitAccessRequest(
  data: {
    cluster_id: string;
    full_name: string;
    email: string;
    phone?: string;
    locality_id?: string;
    reason: string;
  }
): Promise<AccessRequest> {
  const allRequests = getStored<AccessRequest[]>(KEYS.ACCESS_REQUESTS, []);

  const existing = allRequests.find(
    (r) => r.email.toLowerCase() === data.email.toLowerCase() && r.status === 'pending'
  );
  if (existing) {
    throw new Error('A pending access request already exists for this email address.');
  }

  const newRequest: AccessRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    cluster_id: data.cluster_id,
    full_name: data.full_name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim(),
    locality_id: data.locality_id,
    reason: data.reason.trim(),
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  allRequests.unshift(newRequest);
  setStored(KEYS.ACCESS_REQUESTS, allRequests);

  recordAuditLog({
    clusterId: data.cluster_id,
    action: 'ACCESS_REQUEST_SUBMITTED',
    entityType: 'access_request',
    entityId: newRequest.id,
    metadata: {
      email: newRequest.email,
      fullName: newRequest.full_name,
    },
  });

  return newRequest;
}

/**
 * Approve Access Request
 */
export async function approveAccessRequest(params: {
  requestId: string;
  actor: Profile;
  actorRole: RoleType;
  assignedRole: RoleType;
  assignedLocalityId?: string;
  reviewNotes?: string;
}): Promise<AccessRequest> {
  if (!hasPermission(params.actorRole, 'users.approve')) {
    throw new Error('ACCESS_DENIED: Unauthorized to approve access requests.');
  }

  if (!canAssignRole(params.actorRole, params.assignedRole)) {
    throw new Error(`PRIVILEGE_ESCALATION_DENIED: Cannot assign role ${params.assignedRole}.`);
  }

  const allRequests = getStored<AccessRequest[]>(KEYS.ACCESS_REQUESTS, []);
  const reqIndex = allRequests.findIndex((r) => r.id === params.requestId);
  if (reqIndex === -1) {
    throw new Error('Access request not found.');
  }

  const request = allRequests[reqIndex];

  if (!canAccessCluster(params.actor.cluster_id, request.cluster_id, params.actorRole)) {
    throw new Error('ACCESS_DENIED: Cannot manage requests from another cluster.');
  }

  const updatedRequest: AccessRequest = {
    ...request,
    status: 'approved',
    assigned_role: params.assignedRole,
    locality_id: params.assignedLocalityId || request.locality_id,
    reviewed_by: params.actor.id,
    reviewed_at: new Date().toISOString(),
    review_notes: params.reviewNotes,
    updated_at: new Date().toISOString(),
  };
  allRequests[reqIndex] = updatedRequest;
  setStored(KEYS.ACCESS_REQUESTS, allRequests);

  const allProfiles = getStored<Profile[]>(KEYS.PROFILES, []);
  let userProfile = allProfiles.find((p) => p.email.toLowerCase() === request.email.toLowerCase());

  if (userProfile) {
    userProfile.status = 'active';
    userProfile.locality_id = params.assignedLocalityId || userProfile.locality_id;
    userProfile.updated_at = new Date().toISOString();
  } else {
    userProfile = {
      id: `usr-${Date.now()}`,
      full_name: request.full_name,
      email: request.email,
      phone: request.phone,
      cluster_id: request.cluster_id,
      locality_id: params.assignedLocalityId || request.locality_id,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allProfiles.push(userProfile);
  }
  setStored(KEYS.PROFILES, allProfiles);

  const userRoles = getStored<UserRoleRecord[]>(KEYS.USER_ROLES, []);
  const existingRoleIndex = userRoles.findIndex((ur) => ur.user_id === userProfile!.id);
  const roleRecord: UserRoleRecord = {
    id: `ur-${userProfile.id}`,
    user_id: userProfile.id,
    role_id: params.assignedRole,
    cluster_id: request.cluster_id,
    assigned_at: new Date().toISOString(),
    assigned_by: params.actor.id,
  };

  if (existingRoleIndex >= 0) {
    userRoles[existingRoleIndex] = roleRecord;
  } else {
    userRoles.push(roleRecord);
  }
  setStored(KEYS.USER_ROLES, userRoles);

  recordAuditLog({
    userId: params.actor.id,
    userName: params.actor.full_name,
    userRole: params.actorRole,
    clusterId: request.cluster_id,
    action: 'ACCESS_REQUEST_APPROVED',
    entityType: 'access_request',
    entityId: request.id,
    metadata: {
      userEmail: request.email,
      assignedRole: params.assignedRole,
      assignedLocalityId: params.assignedLocalityId,
    },
  });

  return updatedRequest;
}

/**
 * Reject Access Request
 */
export async function rejectAccessRequest(params: {
  requestId: string;
  actor: Profile;
  actorRole: RoleType;
  reviewNotes: string;
}): Promise<AccessRequest> {
  if (!hasPermission(params.actorRole, 'users.approve')) {
    throw new Error('ACCESS_DENIED: Unauthorized to reject access requests.');
  }

  const allRequests = getStored<AccessRequest[]>(KEYS.ACCESS_REQUESTS, []);
  const reqIndex = allRequests.findIndex((r) => r.id === params.requestId);
  if (reqIndex === -1) {
    throw new Error('Access request not found.');
  }

  const request = allRequests[reqIndex];
  if (!canAccessCluster(params.actor.cluster_id, request.cluster_id, params.actorRole)) {
    throw new Error('ACCESS_DENIED: Cannot manage requests from another cluster.');
  }

  const updatedRequest: AccessRequest = {
    ...request,
    status: 'rejected',
    reviewed_by: params.actor.id,
    reviewed_at: new Date().toISOString(),
    review_notes: params.reviewNotes,
    updated_at: new Date().toISOString(),
  };

  allRequests[reqIndex] = updatedRequest;
  setStored(KEYS.ACCESS_REQUESTS, allRequests);

  recordAuditLog({
    userId: params.actor.id,
    userName: params.actor.full_name,
    userRole: params.actorRole,
    clusterId: request.cluster_id,
    action: 'ACCESS_REQUEST_REJECTED',
    entityType: 'access_request',
    entityId: request.id,
    metadata: {
      userEmail: request.email,
      reason: params.reviewNotes,
    },
  });

  return updatedRequest;
}

/**
 * Update User Status (Suspend / Reactivate)
 */
export async function updateUserStatus(params: {
  targetUserId: string;
  newStatus: UserStatus;
  actor: Profile;
  actorRole: RoleType;
}): Promise<Profile> {
  if (!hasPermission(params.actorRole, 'users.suspend')) {
    throw new Error('ACCESS_DENIED: Unauthorized to modify user status.');
  }

  if (params.targetUserId === params.actor.id) {
    throw new Error('Cannot change your own administrative status.');
  }

  const allProfiles = getStored<Profile[]>(KEYS.PROFILES, []);
  const target = allProfiles.find((p) => p.id === params.targetUserId);
  if (!target) {
    throw new Error('User not found.');
  }

  if (!canAccessCluster(params.actor.cluster_id, target.cluster_id, params.actorRole)) {
    throw new Error('ACCESS_DENIED: Cross-cluster modification not allowed.');
  }

  target.status = params.newStatus;
  target.updated_at = new Date().toISOString();
  setStored(KEYS.PROFILES, allProfiles);

  recordAuditLog({
    userId: params.actor.id,
    userName: params.actor.full_name,
    userRole: params.actorRole,
    clusterId: target.cluster_id,
    action: `USER_STATUS_${params.newStatus.toUpperCase()}`,
    entityType: 'profile',
    entityId: target.id,
    metadata: {
      targetEmail: target.email,
      status: params.newStatus,
    },
  });

  return target;
}

// ==============================================================================
// PHASE 2 DATA ACCESS WITH POSTGRESQL RLS RULES
// ==============================================================================

// ------------------------------------------------------------------------------
// ACTIVITIES
// ------------------------------------------------------------------------------

export function getActivities(
  actorProfile: Profile | null,
  actorRole: RoleType,
  filters?: {
    localityId?: string;
    activityType?: string;
    status?: string;
    search?: string;
  }
): Activity[] {
  const allActivities = getStored<Activity[]>(KEYS.ACTIVITIES, SEED_ACTIVITIES);

  // Apply strict database-level RLS filter first!
  const permitted = allActivities.filter((act) => canViewActivity(actorProfile, actorRole, act));

  // Then apply user search & filters
  return permitted
    .filter((act) => {
      if (filters?.localityId && filters.localityId !== 'all' && act.locality_id !== filters.localityId) {
        return false;
      }
      if (filters?.activityType && filters.activityType !== 'all' && act.activity_type !== filters.activityType) {
        return false;
      }
      if (filters?.status && filters.status !== 'all' && act.status !== filters.status) {
        return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matches =
          act.title.toLowerCase().includes(q) ||
          (act.description && act.description.toLowerCase().includes(q)) ||
          (act.location && act.location.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

export function getActivityById(
  id: string,
  actorProfile: Profile | null,
  actorRole: RoleType
): Activity | null {
  const allActivities = getStored<Activity[]>(KEYS.ACTIVITIES, SEED_ACTIVITIES);
  const act = allActivities.find((a) => a.id === id);
  if (!act) return null;

  // RLS check
  if (!canViewActivity(actorProfile, actorRole, act)) {
    throw new Error('ACCESS_DENIED: You do not have permission to view this activity.');
  }

  return act;
}

export async function createActivity(
  data: Omit<Activity, 'id' | 'cluster_id' | 'created_by' | 'created_at' | 'updated_at'>,
  actorProfile: Profile,
  actorRole: RoleType
): Promise<Activity> {
  if (!canCreateActivity(actorRole)) {
    throw new Error('ACCESS_DENIED: You do not have permission to create activities.');
  }

  // Determine initial status based on role
  let initialStatus = data.status || 'draft';
  if (!canPublishActivity(actorRole) && (initialStatus === 'published' || initialStatus === 'approved')) {
    // Coordinators cannot self-publish; submit to pending_review
    initialStatus = 'pending_review';
  }

  const allActivities = getStored<Activity[]>(KEYS.ACTIVITIES, SEED_ACTIVITIES);
  const newActivity: Activity = {
    ...data,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    cluster_id: actorProfile.cluster_id,
    status: initialStatus,
    created_by: actorProfile.id,
    creator_name: actorProfile.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  allActivities.push(newActivity);
  setStored(KEYS.ACTIVITIES, allActivities);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: actorProfile.cluster_id,
    action: initialStatus === 'pending_review' ? 'ACTIVITY_SUBMITTED' : 'ACTIVITY_CREATED',
    entityType: 'activity',
    entityId: newActivity.id,
    metadata: {
      title: newActivity.title,
      status: newActivity.status,
      visibility: newActivity.visibility,
    },
  });

  return newActivity;
}

export async function updateActivity(
  id: string,
  updates: Partial<Activity>,
  actorProfile: Profile,
  actorRole: RoleType
): Promise<Activity> {
  const allActivities = getStored<Activity[]>(KEYS.ACTIVITIES, SEED_ACTIVITIES);
  const index = allActivities.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Activity not found.');

  const existing = allActivities[index];

  if (!canEditActivity(actorProfile, actorRole, existing)) {
    throw new Error('ACCESS_DENIED: You do not have permission to edit this activity.');
  }

  // Prevent unauthorized status elevation
  let nextStatus = updates.status !== undefined ? updates.status : existing.status;
  if (!canPublishActivity(actorRole) && nextStatus === 'published') {
    nextStatus = 'pending_review';
  }

  const updated: Activity = {
    ...existing,
    ...updates,
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  allActivities[index] = updated;
  setStored(KEYS.ACTIVITIES, allActivities);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: actorProfile.cluster_id,
    action: 'ACTIVITY_UPDATED',
    entityType: 'activity',
    entityId: id,
    metadata: {
      title: updated.title,
      status: updated.status,
    },
  });

  return updated;
}

export async function approveAndPublishActivity(
  id: string,
  actorProfile: Profile,
  actorRole: RoleType,
  action: 'approve' | 'publish' | 'archive'
): Promise<Activity> {
  const allActivities = getStored<Activity[]>(KEYS.ACTIVITIES, SEED_ACTIVITIES);
  const index = allActivities.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Activity not found.');

  const act = allActivities[index];
  if (!canAccessCluster(actorProfile.cluster_id, act.cluster_id, actorRole)) {
    throw new Error('ACCESS_DENIED: Cross-cluster modification not allowed.');
  }

  if (action === 'publish' && !canPublishActivity(actorRole)) {
    throw new Error('ACCESS_DENIED: Only administrators can publish activities.');
  }
  if (action === 'approve' && !canApproveActivity(actorRole)) {
    throw new Error('ACCESS_DENIED: Only administrators can approve activities.');
  }
  if (action === 'archive' && !canDeleteActivity(actorRole)) {
    throw new Error('ACCESS_DENIED: Only administrators can archive activities.');
  }

  const statusMap = {
    approve: 'approved' as const,
    publish: 'published' as const,
    archive: 'archived' as const,
  };

  const updated: Activity = {
    ...act,
    status: statusMap[action],
    approved_by: actorProfile.id,
    updated_at: new Date().toISOString(),
  };

  allActivities[index] = updated;
  setStored(KEYS.ACTIVITIES, allActivities);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: act.cluster_id,
    action: `ACTIVITY_${action.toUpperCase()}D`,
    entityType: 'activity',
    entityId: id,
    metadata: {
      title: act.title,
      status: updated.status,
    },
  });

  return updated;
}

// ------------------------------------------------------------------------------
// GROUPS
// ------------------------------------------------------------------------------

export function getGroups(
  actorProfile: Profile | null,
  actorRole: RoleType,
  filters?: {
    localityId?: string;
    groupType?: string;
    search?: string;
  }
): Group[] {
  const allGroups = getStored<Group[]>(KEYS.GROUPS, SEED_GROUPS);

  // Apply RLS
  const permitted = allGroups.filter((grp) => canViewGroup(actorProfile, actorRole, grp));

  return permitted.filter((grp) => {
    if (filters?.localityId && filters.localityId !== 'all' && grp.locality_id !== filters.localityId) {
      return false;
    }
    if (filters?.groupType && filters.groupType !== 'all' && grp.group_type !== filters.groupType) {
      return false;
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const matches =
        grp.name.toLowerCase().includes(q) ||
        (grp.description && grp.description.toLowerCase().includes(q)) ||
        (grp.location && grp.location.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });
}

export function getGroupById(
  id: string,
  actorProfile: Profile | null,
  actorRole: RoleType
): Group | null {
  const allGroups = getStored<Group[]>(KEYS.GROUPS, SEED_GROUPS);
  const grp = allGroups.find((g) => g.id === id);
  if (!grp) return null;

  if (!canViewGroup(actorProfile, actorRole, grp)) {
    throw new Error('ACCESS_DENIED: You do not have permission to view this group.');
  }

  return grp;
}

export async function createGroup(
  data: Omit<Group, 'id' | 'cluster_id' | 'created_by' | 'created_at' | 'updated_at'>,
  actorProfile: Profile,
  actorRole: RoleType
): Promise<Group> {
  if (!canCreateGroup(actorRole)) {
    throw new Error('ACCESS_DENIED: You do not have permission to create community groups.');
  }

  const allGroups = getStored<Group[]>(KEYS.GROUPS, SEED_GROUPS);
  const newGroup: Group = {
    ...data,
    id: `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    cluster_id: actorProfile.cluster_id,
    created_by: actorProfile.id,
    creator_name: actorProfile.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  allGroups.push(newGroup);
  setStored(KEYS.GROUPS, allGroups);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: actorProfile.cluster_id,
    action: 'GROUP_CREATED',
    entityType: 'group',
    entityId: newGroup.id,
    metadata: {
      name: newGroup.name,
      group_type: newGroup.group_type,
    },
  });

  return newGroup;
}

export async function updateGroup(
  id: string,
  updates: Partial<Group>,
  actorProfile: Profile,
  actorRole: RoleType
): Promise<Group> {
  const allGroups = getStored<Group[]>(KEYS.GROUPS, SEED_GROUPS);
  const index = allGroups.findIndex((g) => g.id === id);
  if (index === -1) throw new Error('Group not found.');

  const grp = allGroups[index];
  if (!canEditGroup(actorProfile, actorRole, grp)) {
    throw new Error('ACCESS_DENIED: You do not have permission to edit this group.');
  }

  const updated: Group = {
    ...grp,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  allGroups[index] = updated;
  setStored(KEYS.GROUPS, allGroups);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: grp.cluster_id,
    action: 'GROUP_UPDATED',
    entityType: 'group',
    entityId: id,
    metadata: { name: updated.name },
  });

  return updated;
}

export async function archiveGroup(
  id: string,
  actorProfile: Profile,
  actorRole: RoleType
): Promise<Group> {
  const allGroups = getStored<Group[]>(KEYS.GROUPS, SEED_GROUPS);
  const grpIndex = allGroups.findIndex((g) => g.id === id);
  if (grpIndex === -1) throw new Error('Group not found.');

  const grp = allGroups[grpIndex];
  if (!canEditGroup(actorProfile, actorRole, grp)) {
    throw new Error('ACCESS_DENIED: Unauthorized to archive group.');
  }

  grp.status = 'archived';
  grp.updated_at = new Date().toISOString();
  setStored(KEYS.GROUPS, allGroups);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: grp.cluster_id,
    action: 'GROUP_ARCHIVED',
    entityType: 'group',
    entityId: id,
    metadata: { name: grp.name },
  });

  return grp;
}

// ------------------------------------------------------------------------------
// DOCUMENTS & SECURE STORAGE
// ------------------------------------------------------------------------------

export function getDocuments(
  actorProfile: Profile | null,
  actorRole: RoleType,
  filters?: {
    category?: string;
    search?: string;
  }
): DocumentItem[] {
  const allDocs = getStored<DocumentItem[]>(KEYS.DOCUMENTS, SEED_DOCUMENTS);

  // Apply strict RLS
  const permitted = allDocs.filter((doc) => canViewDocument(actorProfile, actorRole, doc));

  return permitted.filter((doc) => {
    if (filters?.category && filters.category !== 'all' && doc.category !== filters.category) {
      return false;
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      const matches =
        doc.title.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.file_name && doc.file_name.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });
}

export function getDocumentById(
  id: string,
  actorProfile: Profile | null,
  actorRole: RoleType
): DocumentItem | null {
  const allDocs = getStored<DocumentItem[]>(KEYS.DOCUMENTS, SEED_DOCUMENTS);
  const doc = allDocs.find((d) => d.id === id);
  if (!doc) return null;

  if (!canViewDocument(actorProfile, actorRole, doc)) {
    throw new Error('ACCESS_DENIED: You do not have permission to view this document.');
  }

  return doc;
}

export async function uploadDocument(
  data: {
    title: string;
    description?: string;
    category: DocumentCategory;
    fileName: string;
    fileSize: number;
    mimeType: string;
    visibility: 'public' | 'members' | 'coordinators' | 'admins';
  },
  actorProfile: Profile,
  actorRole: RoleType
): Promise<DocumentItem> {
  if (!canUploadDocument(actorRole)) {
    throw new Error('ACCESS_DENIED: You do not have permission to upload documents.');
  }

  // Security Validation on file
  const maxBytes = 20 * 1024 * 1024; // 20 MB
  if (data.fileSize > maxBytes) {
    throw new Error('File exceeds maximum allowable size (20 MB).');
  }

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = '.' + data.fileName.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`File type ${ext} is not allowed. Only PDF, Word, and images are permitted.`);
  }

  const allDocs = getStored<DocumentItem[]>(KEYS.DOCUMENTS, SEED_DOCUMENTS);
  const filePath = `${actorProfile.cluster_id}/${Date.now()}_${data.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const newDoc: DocumentItem = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    cluster_id: actorProfile.cluster_id,
    title: data.title.trim(),
    description: data.description?.trim(),
    category: data.category,
    file_path: filePath,
    file_name: data.fileName,
    file_size: data.fileSize,
    mime_type: data.mimeType,
    visibility: data.visibility,
    status: canApproveDocument(actorRole) ? 'published' : 'pending_review',
    uploaded_by: actorProfile.id,
    uploader_name: actorProfile.full_name,
    approved_by: canApproveDocument(actorRole) ? actorProfile.id : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  allDocs.unshift(newDoc);
  setStored(KEYS.DOCUMENTS, allDocs);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: actorProfile.cluster_id,
    action: 'DOCUMENT_UPLOADED',
    entityType: 'document',
    entityId: newDoc.id,
    metadata: {
      title: newDoc.title,
      fileName: newDoc.file_name,
      category: newDoc.category,
      status: newDoc.status,
    },
  });

  return newDoc;
}

export async function approveDocument(
  id: string,
  actorProfile: Profile,
  actorRole: RoleType
): Promise<DocumentItem> {
  if (!canApproveDocument(actorRole)) {
    throw new Error('ACCESS_DENIED: Only administrators can approve documents.');
  }

  const allDocs = getStored<DocumentItem[]>(KEYS.DOCUMENTS, SEED_DOCUMENTS);
  const index = allDocs.findIndex((d) => d.id === id);
  if (index === -1) throw new Error('Document not found.');

  const doc = allDocs[index];
  if (!canAccessCluster(actorProfile.cluster_id, doc.cluster_id, actorRole)) {
    throw new Error('ACCESS_DENIED: Cross-cluster approval not allowed.');
  }

  doc.status = 'published';
  doc.approved_by = actorProfile.id;
  doc.updated_at = new Date().toISOString();
  setStored(KEYS.DOCUMENTS, allDocs);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: doc.cluster_id,
    action: 'DOCUMENT_APPROVED',
    entityType: 'document',
    entityId: id,
    metadata: { title: doc.title },
  });

  return doc;
}

/**
 * Secure Document Download Authorization
 * Verifies authenticated session, cluster isolation, visibility, and status BEFORE issuing temporary access.
 */
export async function downloadDocument(
  id: string,
  actorProfile: Profile | null,
  actorRole: RoleType
): Promise<{ url: string; fileName: string }> {
  const allDocs = getStored<DocumentItem[]>(KEYS.DOCUMENTS, SEED_DOCUMENTS);
  const doc = allDocs.find((d) => d.id === id);
  if (!doc) {
    throw new Error('Document not found.');
  }

  // Strict Authorization Check
  if (!canViewDocument(actorProfile, actorRole, doc)) {
    recordAuditLog({
      userId: actorProfile?.id,
      userName: actorProfile?.full_name || 'Guest',
      userRole: actorRole,
      clusterId: doc.cluster_id,
      action: 'UNAUTHORIZED_DOWNLOAD_ATTEMPT_BLOCKED',
      entityType: 'document',
      entityId: id,
      metadata: { attemptedDocument: doc.title },
    });
    throw new Error('ACCESS_DENIED: You are not authorized to download this document.');
  }

  // Record authorized download audit
  recordAuditLog({
    userId: actorProfile?.id,
    userName: actorProfile?.full_name || 'Public Visitor',
    userRole: actorRole,
    clusterId: doc.cluster_id,
    action: 'DOCUMENT_DOWNLOADED',
    entityType: 'document',
    entityId: id,
    metadata: { title: doc.title, fileName: doc.file_name },
  });

  // Simulated secure temporary signed blob/URL without exposing storage secrets
  const secureSignedUrl = `blob:https://kimana.portal/storage/signed/${doc.id}?token=${Math.random().toString(36).substring(2, 12)}&exp=${Date.now() + 60000}`;

  return {
    url: secureSignedUrl,
    fileName: doc.file_name || `${doc.title}.pdf`,
  };
}

// ------------------------------------------------------------------------------
// ANNOUNCEMENTS
// ------------------------------------------------------------------------------

export function getAnnouncements(
  actorProfile: Profile | null,
  actorRole: RoleType,
  filters?: {
    search?: string;
  }
): Announcement[] {
  const allAnnouncements = getStored<Announcement[]>(KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);

  // Apply RLS
  const permitted = allAnnouncements.filter((ann) => canViewAnnouncement(actorProfile, actorRole, ann));

  return permitted
    .filter((ann) => {
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matches =
          ann.title.toLowerCase().includes(q) ||
          ann.content.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getAnnouncementById(
  id: string,
  actorProfile: Profile | null,
  actorRole: RoleType
): Announcement | null {
  const allAnnouncements = getStored<Announcement[]>(KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  const ann = allAnnouncements.find((a) => a.id === id);
  if (!ann) return null;

  if (!canViewAnnouncement(actorProfile, actorRole, ann)) {
    throw new Error('ACCESS_DENIED: You do not have permission to view this announcement.');
  }

  return ann;
}

export async function createAnnouncement(
  data: {
    title: string;
    content: string;
    visibility: 'public' | 'members' | 'coordinators' | 'admins';
    status?: 'draft' | 'pending_review' | 'published';
  },
  actorProfile: Profile,
  actorRole: RoleType
): Promise<Announcement> {
  if (!canCreateAnnouncement(actorRole)) {
    throw new Error('ACCESS_DENIED: You do not have permission to create announcements.');
  }

  let finalStatus = data.status || 'draft';
  let publishedAt: string | undefined = undefined;

  if (finalStatus === 'published') {
    if (!canPublishAnnouncement(actorRole)) {
      finalStatus = 'pending_review';
    } else {
      publishedAt = new Date().toISOString();
    }
  }

  const allAnnouncements = getStored<Announcement[]>(KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  const newAnn: Announcement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    cluster_id: actorProfile.cluster_id,
    title: data.title.trim(),
    content: data.content.trim(),
    visibility: data.visibility,
    status: finalStatus,
    published_at: publishedAt,
    created_by: actorProfile.id,
    creator_name: actorProfile.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  allAnnouncements.unshift(newAnn);
  setStored(KEYS.ANNOUNCEMENTS, allAnnouncements);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: actorProfile.cluster_id,
    action: finalStatus === 'published' ? 'ANNOUNCEMENT_PUBLISHED' : 'ANNOUNCEMENT_CREATED',
    entityType: 'announcement',
    entityId: newAnn.id,
    metadata: { title: newAnn.title, status: newAnn.status },
  });

  return newAnn;
}

export async function publishAnnouncement(
  id: string,
  actorProfile: Profile,
  actorRole: RoleType
): Promise<Announcement> {
  if (!canPublishAnnouncement(actorRole)) {
    throw new Error('ACCESS_DENIED: Only administrators can publish announcements.');
  }

  const allAnnouncements = getStored<Announcement[]>(KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  const index = allAnnouncements.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Announcement not found.');

  const ann = allAnnouncements[index];
  if (!canAccessCluster(actorProfile.cluster_id, ann.cluster_id, actorRole)) {
    throw new Error('ACCESS_DENIED: Cross-cluster announcement modification not allowed.');
  }

  ann.status = 'published';
  ann.published_at = new Date().toISOString();
  ann.approved_by = actorProfile.id;
  ann.updated_at = new Date().toISOString();
  setStored(KEYS.ANNOUNCEMENTS, allAnnouncements);

  recordAuditLog({
    userId: actorProfile.id,
    userName: actorProfile.full_name,
    userRole: actorRole,
    clusterId: ann.cluster_id,
    action: 'ANNOUNCEMENT_PUBLISHED',
    entityType: 'announcement',
    entityId: id,
    metadata: { title: ann.title },
  });

  return ann;
}

// ------------------------------------------------------------------------------
// GLOBAL SEARCH ENGINE (PERMISSION-AWARE AT QUERY TIME)
// ------------------------------------------------------------------------------

export function globalSearch(
  rawQuery: string,
  actorProfile: Profile | null,
  actorRole: RoleType
): SearchResultItem[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  // 1. Search Activities (Permission-filtered first)
  const activities = getActivities(actorProfile, actorRole, { search: q });
  activities.forEach((act) => {
    results.push({
      id: act.id,
      type: 'activity',
      title: act.title,
      description: act.description,
      date: act.start_time,
      status: act.status,
      visibility: act.visibility,
      path: `/activities/${act.id}`,
    });
  });

  // 2. Search Groups (Permission-filtered first)
  const groups = getGroups(actorProfile, actorRole, { search: q });
  groups.forEach((grp) => {
    results.push({
      id: grp.id,
      type: 'group',
      title: grp.name,
      description: grp.description,
      status: grp.status,
      visibility: grp.visibility,
      path: `/groups/${grp.id}`,
    });
  });

  // 3. Search Documents (Permission-filtered first)
  const documents = getDocuments(actorProfile, actorRole, { search: q });
  documents.forEach((doc) => {
    results.push({
      id: doc.id,
      type: 'document',
      title: doc.title,
      description: doc.description,
      status: doc.status,
      visibility: doc.visibility,
      path: `/documents/${doc.id}`,
    });
  });

  // 4. Search Announcements (Permission-filtered first)
  const announcements = getAnnouncements(actorProfile, actorRole, { search: q });
  announcements.forEach((ann) => {
    results.push({
      id: ann.id,
      type: 'announcement',
      title: ann.title,
      description: ann.content.substring(0, 150) + '...',
      date: ann.published_at || ann.created_at,
      status: ann.status,
      visibility: ann.visibility,
      path: `/announcements/${ann.id}`,
    });
  });

  // 5. Search Localities
  const localities = getLocalities(actorProfile?.cluster_id || PRIMARY_CLUSTER_ID, actorProfile || undefined, actorRole);
  localities.forEach((loc) => {
    if (loc.name.toLowerCase().includes(q) || (loc.description && loc.description.toLowerCase().includes(q))) {
      results.push({
        id: loc.id,
        type: 'locality',
        title: loc.name,
        description: loc.description,
        path: '/communities',
      });
    }
  });

  return results;
}
