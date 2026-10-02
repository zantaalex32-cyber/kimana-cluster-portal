# Kimana Cluster Portal

> **Phase 2: Core Information System Completed**
> One secure place for approved cluster information, activities, resources, and community coordination.

---

## 1. Overview & Core Principles

The **Kimana Cluster Portal** is an information and coordination platform designed to serve the community of Kimana and its surrounding localities (Kimana Central, Isinet, Namelok, Tikondo) at the foot of Mount Kilimanjaro in Kajiado South, Kenya.

### Core Architecture Principles:
- **Controlled Information Flow:** Does not invent authorities, policies, or organizational decisions. Administrators control what information enters the system and what becomes visible to members or the public.
- **Strict Information Boundaries:** Clearly separates Public Information, Member Information, Coordinator Information, Administrator Information, and Private Personal Information.
- **Row Level Security (RLS):** All data retrieval adheres strictly to PostgreSQL Row Level Security policies. Private information is never leaked through search or direct queries.
- **Multi-Cluster Extensibility:** Primary cluster seeded as `Kimana Cluster`, with data-layer isolation preventing cross-cluster leakage.

---

## 2. Technology Stack

- **Runtime & Client:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Zod + React Hook Form
- **Database & Security:** PostgreSQL schema migrations (`01_initial_schema.sql`, `02_core_information.sql`), Row Level Security (RLS) policies, triggers, and functions.
- **Storage:** Supabase Storage security policies with authenticated and signed URL verification.
- **Authentication & RBAC:** Supabase Auth compatible authentication layer with secure session persistence, role verification, and password reset handling.
- **Mobile-First Touch Architecture:** 44px+ hitboxes, fixed bottom navigation bar, responsive layouts, and PWA installation support.

---

## 3. Database Schema & Migrations

### Migration 01: Initial Foundation (`database/migrations/01_initial_schema.sql`)
1. **`clusters`**: Multi-cluster entity. Primary: `Kimana Cluster`.
2. **`localities`**: Sub-cluster community units: `Kimana Central`, `Isinet`, `Namelok`, `Tikondo`.
3. **`roles`**: System roles (`public`, `member`, `coordinator`, `cluster_admin`, `super_admin`).
4. **`permissions`**: 28 granular permission codes.
5. **`role_permissions`**: Granular role-to-permission mappings.
6. **`profiles`**: User profiles with cluster affiliation, locality affiliation, status (`pending`, `active`, `suspended`, `inactive`).
7. **`user_roles`**: User-role associations.
8. **`access_requests`**: Approval pipeline (`pending`, `approved`, `rejected`).
9. **`audit_logs`**: Immutable security trail for login events, approvals, role modifications, and status changes.

### Migration 02: Core Information System (`database/migrations/02_core_information.sql`)
1. **`activities`**: Scheduled gatherings (`id`, `cluster_id`, `locality_id`, `title`, `description`, `activity_type`, `start_time`, `end_time`, `location`, `visibility`, `status`, `created_by`, `approved_by`).
   - Statuses: `draft`, `pending_review`, `approved`, `published`, `cancelled`, `archived`.
   - Visibilities: `public`, `members`, `coordinators`, `admins`.
2. **`groups`**: Active community groups (`id`, `cluster_id`, `locality_id`, `name`, `group_type`, `description`, `meeting_day`, `meeting_time`, `location`, `visibility`, `status`, `created_by`).
   - Group types: `Study Circle`, `Devotional Meeting`, `Children's Class`, `Junior Youth Group`, `Other`.
3. **`documents`**: Official resource repository (`id`, `cluster_id`, `title`, `description`, `category`, `file_path`, `file_name`, `file_size`, `mime_type`, `visibility`, `status`, `uploaded_by`, `approved_by`).
   - Categories: `Cluster Resources`, `Activity Resources`, `Training Materials`, `Guidelines`, `Forms`, `Reports`, `Other`.
4. **`announcements`**: Official notices (`id`, `cluster_id`, `title`, `content`, `visibility`, `status`, `published_at`, `created_by`, `approved_by`).
5. **Storage Security Policies**: Supabase Storage bucket `cluster-documents` with RLS download enforcement.

---

## 4. Role-Based Access Control (RBAC) & Visibility Matrix

| Role | Hierarchy | Activities Scope | Documents & Groups Scope | Announcements Scope |
| :--- | :--- | :--- | :--- | :--- |
| **`public`** | Level 1 | Published & Public only | Public documents & groups only | Published & Public notices only |
| **`member`** | Level 2 | Published (`public` + `members`) | Published member docs & active groups | Published member announcements |
| **`coordinator`** | Level 3 | Create drafts, submit for review, view coordinator activities | Upload docs, view coordinator materials, register groups | Draft notices, submit for review |
| **`cluster_admin`** | Level 4 | Approve, publish, edit, archive all cluster activities | Approve docs, manage groups, audit downloads | Publish, edit, archive notices |
| **`super_admin`** | Level 5 | System-wide authority | System-wide authority | System-wide authority |

---

## 5. Demonstration Personas & RBAC Switcher

For ease of testing and evaluation, the portal includes an interactive **RBAC Testing Bar** enabling 1-click role switching:

| Persona | Name | Role | Email | Password | Locality |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Tariq Mwalimu | `super_admin` | `superadmin@kimanaportal.org` | `superadmin123` | Kimana Central |
| **Cluster Admin** | Amina Naserian | `cluster_admin` | `admin@kimanaportal.org` | `admin123` | Kimana Central |
| **Coordinator** | Joseph Kiprotich | `coordinator` | `coordinator@kimanaportal.org` | `coordinator123` | Isinet Locality |
| **Member** | Faith Sianoi | `member` | `member@kimanaportal.org` | `member123` | Namelok Locality |
| **Pending User** | David Omondi | `public` (Pending) | `applicant@kimanaportal.org` | `applicant123` | Kimana Central |

---

## 6. Automated In-App Verification Suite

Navigate to `/tests` or click **"Tests"** in the top navigation bar to execute the automated 10-point test suite:
1. **Demo Profiles & Roles Initialization:** Passed.
2. **Member Profile Self-Isolation Under RLS:** Passed.
3. **CRITICAL: Member Direct Access to Admin Requests:** `ACCESS_DENIED` enforced.
4. **CRITICAL: Member Cannot View Admin/Draft Activities:** `ACCESS_DENIED` on IDOR attempt.
5. **CRITICAL: Coordinator Cannot Self-Publish; Admin Approves:** Workflow enforced with audit trail.
6. **Group Schedule Access & Privacy Shield:** Participant rosters kept private.
7. **CRITICAL: Document Download Clearance & Direct Path Guard:** Unauthorized download blocked with `ACCESS_DENIED`.
8. **Members Only View Published Notices; Drafts Omitted:** Passed.
9. **CRITICAL: Search Does Not Leak Protected Records:** Database query filters prior to return.
10. **CRITICAL: Cross-Cluster Isolation Across All Entities:** Cluster A member blocked from accessing Cluster B activities, groups, and documents.
