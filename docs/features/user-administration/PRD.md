---
status: Reviewed
owner: 'Oleksandr Vorovchenko'
reviewers: ['Tech Lead', 'Security Lead']
updated_at: '2026-08-28'
feature_size: '<TBD by sdlc:classify-size>'
stage: '03'
ticket: '<TBD>'
---

# PRD — user-administration

> **Inputs (required):** [project idea-brief](../../idea-brief.md) · [project CONTEXT](../../CONTEXT.md)
> **Split note (2026-08-28):** extracted from the original `custom-forms` PRD (US-01/02/03, AC-01–06) when the project docs were reorganized from a single `custom-forms` feature into `docs/PROJECT.md` + per-feature docs. Content below is unchanged from that PRD, not re-derived.
> **Reference module:** git commit `0a09af4` ("[CF-13] Designer") — `server/api/src/app/auth/` (login, JWT strategy) and `server/api/src/app/users/` (user CRUD, role assignment, `RolesGuard`/`@Roles()`) already exist at this revision.

## 1. Context

Access to Designer and to user/role administration is controlled by three roles — Admin, Creator, User. An Admin governs who can log in and which role each account holds; Designer is reachable only by Admin and Creator accounts, so the User role cannot alter or create screens, only use published ones. Authentication and role administration are delivered before Designer/Runtime capabilities so that screens with different roles can be tested from day one (build-sequence constraint, project idea-brief §13).

## 2. Goals

- An Admin controls who can access Designer and what role each user holds, so Designer access stays centrally governed from day one.

## 3. Non-goals

- Field-level or screen-level permission granularity beyond the three roles (Admin/Creator/User) — role-level access is the only granularity this iteration supports.
- Per-screen access grants beyond the three fixed roles — deferred to a future iteration (see Open questions).

## 4. User stories

### US-01: Log into the application

**As a** Admin, Creator, or User
**I want** to log into the application with my credentials
**So that** I can access the parts of the system my role permits

### US-02: Manage user roles

**As a** Admin
**I want** to create user accounts and assign each one the Admin, Creator, or User role
**So that** I control who can build screens and who can only use them

### US-03: Restrict Designer to authorized roles

**As a** Admin
**I want** Designer to be reachable only by Admin and Creator accounts
**So that** the User role cannot alter or create screens, only use published ones

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** a registered Admin, Creator, or User account
**When** the account holder logs in with correct credentials
**Then** the system authenticates them and grants access limited to their role's capabilities

### AC-02 (US-01) — error

**Given** a login attempt with an incorrect password or unknown account
**When** the attempt is submitted
**Then** the system rejects it with a generic "invalid credentials" message, without revealing whether the account exists

### AC-03 (US-01) — error / abuse defense

**Given** repeated failed login attempts on the same account (5 failed attempts within 15 minutes)
**When** the next attempt is made
**Then** the system locks further attempts on that account for 15 minutes from the 5th failed attempt, after which attempts are automatically allowed again (no Admin-override unlock this iteration), returning the same generic "invalid credentials" message throughout, without revealing that a lockout is in effect

### AC-04 (US-02) — happy path

**Given** an authorized Admin
**When** the Admin creates a new user account and assigns it the Creator role
**Then** the system records the account with the Creator role and confirms to the Admin

### AC-05 (US-02) — authorization

**Given** an authenticated Creator or User account
**When** that account attempts to create a user or change a role assignment
**Then** the system denies the action and explains that only Admin accounts manage users

### AC-06 (US-03) — authorization

**Given** an authenticated User account
**When** the account attempts to open Designer
**Then** the system denies access and explains that Designer is limited to Admin and Creator roles

## 6. Non-functional requirements

<!-- N/A: no user-administration-specific NFR beyond the shared project-wide targets already captured at docs/PROJECT.md / docs/adr/0002 (RolesGuard) and 0004 (single-instance, no multi-tenancy) -->

## 6.1 Security / privacy

- **AuthZ/AuthN impact:** introduces the three-role model (Admin/Creator/User) enforced by `docs/adr/0002-per-endpoint-roles-guard-for-authorization.md`. User administration itself is limited to Admin; Designer access is limited to Admin + Creator (AC-06).
- **Abuse case — brute-force login:** repeated failed logins are throttled by the account lockout in AC-03.
- **Security review:** Required — new authz boundary (three roles).

## 7. Metrics / KPIs

<!-- N/A: no user-administration-specific KPI defined; adoption/build-time KPIs live in docs/features/designer/PRD.md -->

## 8. Open questions

- [ ] Per-screen access grants beyond the three fixed roles (e.g. an Admin assigning a specific Creator edit vs. read-only access to one screen) — raised during clarification but conflicts with the current §3 non-goal (role-level access only); kept out of this iteration's scope. Revisit as a candidate for a future iteration. — owner: Oleksandr Vorovchenko, due: next iteration scoping
