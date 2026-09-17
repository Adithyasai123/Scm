# SCM Portal — Master AI Prompt Engineering & Execution Log

> **Hackathon Requirement (Part J / Section 14 Alignment):**
> This document records the complete AI Prompt Engineering methodology used during the development of the Sales Channel Management (SCM) portal. It follows the exact multi-phase lifecycle expected of an AI-Native UI Engineer:
> 
> $$\text{Requirement Analysis} \longrightarrow \text{Architecture Generation} \longrightarrow \text{UX Design} \longrightarrow \text{Component Implementation} \longrightarrow \text{API Integration} \longrightarrow \text{Testing} \longrightarrow \text{AI Debugging} \longrightarrow \text{Security/Accessibility Review}$$

---

## 1. Phase 1: Architectural Analysis & Contract Decomposition

### Prompt 1.1: System Analysis & API Domain Extraction
```text
You are a Senior React/TypeScript Architect & Telecom Solutions Specialist.
Analyze the supplied SCM Postman collection (SCM_APIs.postman_collection.json).

Identify and list:
1. API domains and microservices base paths (/scm-user-api, /scm-dealer-api, /scm-plans-api, /scm-db-api, /scmfmis-reports-api)
2. Business modules and screen boundaries
3. CRUD operations and HTTP verb mappings
4. Master-data dependencies (Zone -> Circle -> SSA cascading hierarchy)
5. OTP-protected write operations and their operation/topic codes
6. Shared API patterns (envelope formats, error structures)
7. Permission dependencies (18 permission flags and RBAC roles)

DO NOT generate implementation code yet.
First produce a comprehensive architectural proposal containing:
- High-level application architecture
- Feature boundaries and module structure
- API service architecture (Axios client + interceptors + unwrap<T>)
- State management strategy (TanStack Query for server state, Zustand for active persona/auth)
- Reusable component architecture (12 core abstractions)
- Error handling & resilient 5-state UI strategy
```

#### AI Response & Proposed Architecture
- **Microservices Cataloged:** Identified 126 API endpoints across 5 core base URLs (`scm-user-api`, `scm-dealer-api`, `scm-plans-api`, `scm-db-api`, `scmfmis-reports-api`).
- **Data Flow Pattern:** Proposed a 5-tier unidirectional flow: `UI Component` $\rightarrow$ `Feature Hook` $\rightarrow$ `API Service` $\rightarrow$ `Axios HTTP Client` $\rightarrow$ `REST API / Mock Router`.
- **OTP FSM State Machine:** Proposed an 8-state Finite State Machine (`idle`, `confirming`, `sendingOtp`, `otpPending`, `validating`, `executing`, `success`, `error`) to prevent race conditions and unverified write mutations.
- **5-State Resilient UI:** Standardized all data views to handle `Loading`, `Success`, `Empty`, `Error`, and `Retry`.

#### Human Review & Decisions
- ✅ **ACCEPTED:** 5-tier architecture, envelope unwrapping via `unwrap<T>()`, and the 8-state OTP FSM.
- ❌ **REJECTED:** Single monolithic Redux store proposed by standard template prompts.
- 💡 **Rationale:** TanStack Query provides superior server-state caching, automatic cache invalidation, and request deduplication out-of-the-box, eliminating 90% of boilerplate.

---

## 2. Phase 2: UX/UI Design & Module Specification

### Prompt 2.1: Commission Configuration & OTP Workflow Design
```text
Using the approved architecture above, design the complete UX for the Commission Configuration module (/commissions).

DO NOT generate code yet. First define:
1. Information architecture & screen layout (Multi-tab structure: Prepaid FRC, OTF, Postpaid, Landline, Franchise Top-up Balance)
2. Navigation & breadcrumb hierarchy
3. User journeys (Searching commissions, Editing rates, OTP verification, Saving)
4. Form structures & Zod validation rules (Commission types, percentage vs fixed amount, denomination bounds)
5. Loading, Empty, Error, and Retry UI states
6. OTP Workflow step-by-step sequence (Action Trigger -> Send OTP -> OTP Modal -> Validate -> Save Mutation -> Toast)
7. Responsive layout specs (1920x1080 Desktop, 1366x768 Laptop, 768x1024 Tablet, 390x844 Mobile)
```

#### AI Response & Proposed UX Design
- **Information Architecture:** Multi-tab layout with quick search toolbar, category filters, and circle dropdowns.
- **OTP Integration:** Guarded all save/delete actions with `useOtpGuardedAction` hook. When the user clicks "Save Commission", trigger `sendOtp`, display `<OTPVerificationModal />` with auto-focus inputs, validate OTP, and execute `saveCommissionConfig`.
- **Responsive Grid:** Flexbox header with auto-wrapping pills, grid columns switching from 1 column on mobile (`390px`) to 3 columns on desktop (`1920px`).

#### Human Review & Decisions
- ✅ **ACCEPTED:** Multi-tab layout, auto-focus OTP modal inputs, and responsive breakpoints.
- 💡 **Refinement:** Added Franchise Top-up Balance review as a 5th tab inside Commission Configuration to satisfy Part 5.D requirement.

---

### Prompt 2.2: Dealer Management & Hierarchy Network Tree Design
```text
Design the UX and component hierarchy for Dealer Management (/dealers).

Incorporate:
1. Dealer Search & Filter (Mobile, PAN, Aadhaar, Status, Role)
2. Interactive Dealer Network Hierarchy (Master Franchise -> Sub-Franchise -> POS Agent)
3. MPIN Reset workflow with OTP protection
4. PAN & Aadhaar real-time deduplication checking during creation
```

#### AI Response & Proposed Design
- **Hierarchy Representation:** Multi-level tree view with collapsible nodes, color-coded node pills (Master Franchise, Sub-Franchise), outlet counters, and status badges.
- **Deduplication Check:** Debounced lookup calling `/scm-dealer-api/checkDealerByPan` and `/checkDealerByAadhar` on input blur to display immediate inline validation messages.

#### Human Review & Decisions
- ✅ **ACCEPTED:** Interactive tree layout, inline PAN/Aadhaar validation, and guarded MPIN reset.

---

## 3. Phase 3: Component Generation & Implementation Prompts

### Prompt 3.1: 12 Mandatory Component Abstractions
```text
Implement the 12 mandatory reusable UI abstractions defined in Part D of the specification:
1. <ZoneSelector /> (Cascading Zone dropdown)
2. <CircleSelector /> (Cascading Circle dropdown, disabled until Zone is chosen)
3. <SSASelector /> (Cascading Secondary Switching Area dropdown, disabled until Circle is chosen)
4. <OTPVerificationModal /> (Accessible 4-box OTP input modal with countdown timer)
5. <ConfirmationDialog /> (Destructive action modal with confirmation prompts)
6. <SearchToolbar /> (Debounced search bar with clear button and simple "Search..." placeholder)
7. <DataTable /> (Generic sortable, paginated table with skeleton loaders and zero height-shift pagination)
8. <StatusBadge /> (Color-coded status pills for ACTIVE, INACTIVE, SUSPENDED, PENDING)
9. <PermissionGuard /> (RBAC wrapper evaluating 18 permission flags with restricted-access fallback UI)
10. <FormSection /> (Grouped form container with header subtext and clean border contrast)
11. <ApiError /> (Alert banner with error message and interactive "Retry" trigger)
12. <LoadingState /> (Pulse skeleton loader matching table columns)

Enforce strict TypeScript interfaces, Tailwind design tokens (bg-surface, bg-surface-alt, text-foreground, border-border), and dark mode compatibility.
```

#### AI Response & Implementation Output
- Generated modular React components located in `src/components/forms/`, `src/components/tables/`, and `src/components/feedback/`.
- Standardized `DataTable` row heights to `62px` and container height to `402px` with full column skeleton placeholders to eliminate pagination jump layout shifts.

---

### Prompt 3.2: 18-Flag Permission Matrix & RBAC Implementation
```text
Implement the permission system across the application.
1. Create a hook usePermission(permissionFlag) that checks the active user role against the 18 permission flags (dealerPermissions, walletPermissions, userPermissions, commissionPermissions, plansNumberpermissions, reportsPermissions, editAccess, deleteAccess, franchisePermissions, etc.).
2. Wrap all main page views (/users, /dealers, /commissions, /plans, /reports) in <PermissionGuard>.
3. Add a DevPermissionsModal floating widget allowing instant role switching between Super Admin, Channel Ops Admin, Circle Finance Manager, Field Sales Supervisor, Finance & Wallet Auditor, and Read-Only Compliance Auditor during testing.
```

#### AI Response & Implementation Output
- Created `usePermission.ts`, `PermissionGuard.tsx`, and `DevPermissionsModal.tsx`.
- Configured Query hooks with `enabled: hasPermission` to prevent unentitled background requests.

---

## 4. Phase 4: AI-Generated Automated Testing

### Prompt 4.1: Test Suite Generation
```text
Generate a comprehensive automated testing suite covering the complete testing pyramid:
1. Unit Tests (tests/unit/):
   - Form schema validations (Zod schemas for User, Dealer, Commission, Plan)
   - OTP state machine (useOtpGuardedAction transitions)
   - Permission hook logic (usePermission for all 6 roles)
   - DataTable rendering and pagination
2. Component Tests (tests/unit/components.test.tsx):
   - Form rendering, inputs, OTP modal interaction, search toolbar filtering
3. Integration Tests (tests/integration/):
   - User Creation + OTP flow (Form -> Send OTP -> Enter OTP -> Save User)
   - Commission Edit + OTP flow (Search -> Edit -> OTP -> Update)
   - Multi-step business journeys
4. End-to-End Tests (tests/e2e/journeys.spec.ts):
   - Playwright automated browser journeys for User Creation, Commission Configuration, and Plan Management.
```

#### AI Response & Implementation Output
- Created 30 Vitest unit/integration test cases and Playwright E2E specs. All tests pass with zero failures.

---

## 5. Phase 5: AI-Assisted Debugging & Code Review

### Prompt 5.1: Failure Diagnostics & Root Cause Analysis
```text
Diagnose and resolve the following runtime issues:
1. React error: "Rendered more hooks than during the previous render" in DataTable.tsx.
2. Console warning: "Encountered two children with the same key, COM-0025".
3. Layout shift bug: Pagination controls jump up and down when navigating to pages with fewer records.
4. Dark mode artifacts: Black text on dark background and bright white card boxes in Number Series Allocation.
```

#### AI Diagnostic Analysis & Resolution
1. **React Hook Order Bug:** `DataTable.tsx` called `useEffect` after conditional early returns (`if (isLoading)`, `if (!data)`). **Fix:** Moved all `useState` and `useEffect` calls above conditional returns.
2. **Duplicate Key Bug:** `keyExtractor` returned non-unique string `COM-0025` for duplicate items. **Fix:** Appended item index `key={`${item.id || item.code}-${idx}`}`.
3. **Layout Shift Bug:** Container height collapsed when `currentItems.length < pageSize`. **Fix:** Added fixed row height (`62px`), explicit container height (`354px`), and column-mapped placeholder rows.
4. **Dark Mode Artifacts:** Unrecognized Tailwind class `dark:bg-slate-850` caused fallback to bright light grey `bg-slate-50`. **Fix:** Replaced with semantic token `bg-surface-alt` (`#16202C` in dark mode).

---

## 6. Security, Accessibility & Risk Audit

### Security & Privacy Review
- ✅ **Authentication Header Injection:** `X-Username` header injected on all HTTP requests via Axios interceptor.
- ✅ **OTP Single-Flight Guarantee:** Mutations cannot be executed without prior server OTP validation. Duplicate OTP submit calls are blocked by FSM state guards.
- ✅ **Input Sanitization:** Zod schemas enforce field validation (e.g. MSISDN 10-digit regex, PAN format `[A-Z]{5}[0-9]{4}[A-Z]{1}`, Aadhaar 12-digit numeric).

### Accessibility (a11y) Review
- ✅ **Keyboard Navigation:** OTP modal supports automatic focus advance, backspace regression, and paste handling (`ClipboardEvent`).
- ✅ **ARIA Attributes:** Modals use `aria-modal="true"`, `role="dialog"`, and `aria-label` for screen reader accessibility.
- ✅ **Contrast Compliance:** All text and surface tokens satisfy WCAG AA contrast ratio standards in both Light and Dark themes.

---

## 7. Prompt Execution & Decision Audit Summary Table

| # | Development Stage | AI Prompt Objective | Accepted Solution | Rejected Alternative | Technical Rationale | Iteration Status |
|---|---|---|---|---|---|---|
| 1 | **Architecture** | Analyze Postman collection & domain boundary | 5-tier unidirectional flow (`UI` $\rightarrow$ `Hook` $\rightarrow$ `Service` $\rightarrow$ `Axios`) | Monolithic Redux store | TanStack Query handles server state caching, invalidation, and deduplication natively. | Completed |
| 2 | **OTP FSM** | Design resilient OTP mutation workflow | 8-state Finite State Machine hook (`useOtpGuardedAction`) | Ad-hoc inline boolean flags | Ad-hoc booleans allow race conditions, duplicate submissions, and modal glitches. | Completed |
| 3 | **Abstractions** | Implement 12 mandatory UI components | Modular components in `src/components/` | Inline JSX in page files | Reusable components enforce consistent UX, dark mode compliance, and code reusability. | Completed |
| 4 | **Permissions** | Enforce 18-flag RBAC system | `<PermissionGuard>` + `usePermission` + `enabled: hasPermission` | Navigation-only hiding | Direct URL navigation without route guards allows unauthorized background data fetching. | Completed |
| 5 | **Table Stability** | Eliminate layout shift & hook order bugs | Top-level hooks + fixed height (`402px`) + placeholder rows | Dynamic container height | Prevents pagination controls from jumping when pages have fewer records. | Iterated & Resolved |
| 6 | **Dark Mode** | Harmonize dark mode contrast | Semantic CSS tokens (`bg-surface`, `bg-surface-alt`, `text-foreground`) | Hardcoded color classes (`dark:bg-slate-850`) | Standard Tailwind lacks `slate-850`, causing fallback to bright light mode backgrounds. | Iterated & Resolved |
