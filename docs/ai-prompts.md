# SCM Portal — AI Prompt Engineering & Development Log

This document records the exact progression of prompts, evaluations, accepted solutions, rejected alternatives, and iterative refinements used to build the Sales Channel Management (SCM) Portal using an AI coding agent as the primary development mechanism.

---

## 1. Master Prompts & Development Stages

### Stage 0: System Persona & Architect Setup
- **Prompt:**
  > "You are an AI-Native Principal UI Engineer & Telecom Solutions Architect. We are building an enterprise-grade Sales Channel Management (SCM) portal from the provided Postman collection (SCM_APIs.postman_collection.json). Establish the foundational architecture, technology stack, directory structure, coding standards, and core invariants for 100% offline resilience."
- **AI Output & Proposed Solution:**
  - Stack: Next.js 15 App Router, TypeScript, Tailwind CSS, TanStack Query (React Query v5), Zustand, React Hook Form + Zod, MSW v2.
  - 5-layer unidirectional architecture: UI Components → Custom Hooks → Domain Services → HTTP Client (Axios) → Mock Layer.
  - Strict invariants: Zero direct `fetch()` in components; envelope unwrapping via `unwrap<T>()`; 5-state UI (Loading, Success, Empty, Error, Retry); OTP Finite State Machine.
- **Accepted Solution:** Fully adopted the 5-layer architecture and typed domain contracts.
- **Rejected Alternatives:** Single monolithic Redux store (rejected due to excessive boilerplate and poor server-state caching capabilities compared to TanStack Query).

---

### Stage 1: API Analysis & Contract Decomposition
- **Prompt:**
  > "Analyze SCM_APIs.postman_collection.json. Extract all microservices, endpoints, URL query parameters, request bodies, and response envelopes. Map the geographic hierarchy (Zone -> Circle -> SSA) and identify all OTP-protected mutations."
- **AI Output & Proposed Solution:**
  - Cataloged 126 endpoints across 5 core domains:
    1. User Administration (`/scm-user-api/scm-user-api/...`)
    2. Dealer Management (`/scm-dealer-api/scm-dealer-api/...`)
    3. Commission Engine (`/scm-plans-api/scm-product-api/...`)
    4. Plans, Denominations & MNP (`/scm-plans-api/...`, `/scm-db-api/...`)
    5. Franchise & Wallet Governance (`/scmfmis-reports-api/...`, `/scm-stock-api/...`)
  - Identified standard `{ status, message, data }` response envelope and exceptions (raw arrays).
  - Mapped OTP topics (`UserCreation`, `CommissionConfig`, `DealerHierarchy`, `ResetMpin`, `FranchiseAddBalanceApprove`).
- **Accepted Solution:** Documented in `docs/api-mapping.md` and implemented in domain service modules under `src/api/`.

---

### Stage 2: Architecture & Invariants Definition
- **Prompt:**
  > "Design the client HTTP layer with Axios interceptors. Enforce authentication injection (X-Username), automatic response unwrapping, normalized error formatting (ApiError), and an 8-state OTP Finite State Machine."
- **AI Output & Proposed Solution:**
  - Implemented `src/api/client.ts` with request interceptor attaching `X-Username` and response interceptor mapping HTTP status codes to user-friendly messages.
  - Implemented `useOtpGuardedAction` hook with states: `idle`, `confirming`, `sendingOtp`, `otpPending`, `validating`, `validated`, `executing`, `success`, `error`.
  - Implemented `useZoneCircleSSA` hook with automatic cascading reset.
- **Accepted Solution:** Implemented and validated with unit tests.

---

### Stage 3: UX Design & Reusable Component System
- **Prompt:**
  > "Design a clean, dense, data-rich telecom operations UI inspired by modern enterprise design systems. Build reusable components: DataTable, OTPVerificationModal, PermissionGuard, StatusBadge, MetricCard, PageHeader, and DevPermissionSwitcher."
- **AI Output & Proposed Solution:**
  - `DataTable`: Generic sortable, searchable, paginated table with skeleton loaders and empty states.
  - `OTPVerificationModal`: Accessible 4-box OTP input with auto-focus, paste handling, countdown timer, and progress indicators.
  - `PermissionGuard`: RBAC gate evaluating role flags with informative restricted-access fallback screen.
  - `DevPermissionSwitcher`: Floating drawer for instant role switching across 6 telecom personas.
- **Accepted Solution:** Fully integrated across all application views.

---

### Stage 4: Feature Implementation & Screen Construction
- **Prompt:**
  > "Build the 5 primary application views:
  > 1. Dashboard (`/`) — KPI metric cards, quick actions, channel alerts.
  > 2. User Administration (`/users`) — User directory, onboard modal with 18-flag permissions matrix, status toggle.
  > 3. Dealer Management (`/dealers`) — Dealer directory, hierarchy tree view, PAN/Aadhaar deduplication check, MPIN reset.
  > 4. Commission Engine (`/commissions`) — Multi-tab configuration for Prepaid FRC, OTF, Postpaid, Landline, and Franchise Top-up Balance.
  > 5. Plans & Numbers (`/plans`) — Tariff catalog, denomination matrix, MNP port-in requests, number series allocation."
- **AI Output & Proposed Solution:**
  - Created high-density, production-quality pages utilizing React Query hooks and OTP-guarded mutations.
- **Accepted Solution:** Fully implemented with 100% endpoint coverage.

---

### Stage 5: AI-Assisted Debugging & Resolution
- **Prompt:**
  > "Investigate and resolve critical network and authorization defects:
  > 1. Browser console shows `OPTIONS http://localhost:3001/... net::ERR_CONNECTION_REFUSED` on `/commissions`.
  > 2. Role `Finance & Wallet Auditor` displays an unexpected API error when opening the Commission page.
  > 3. Section 5.D specifies Franchise Add Balance review belongs in Commission Configuration.
  > Provide a resilient, zero-CORS architecture that works flawlessly in browser and test runners."
- **AI Output & Proposed Solution:**
  - Replaced hardcoded `localhost:3001` with same-origin relative URLs (`""`).
  - Created native Next.js 15 catch-all server route handlers backed by `mockApiRouter.ts`.
  - Enclosed `/commissions`, `/dealers`, `/plans`, `/users`, and `/reports` with `<PermissionGuard>` and `enabled: hasPermission`.
  - Added 5th tab `Franchise Top-up Balance` (`FRANCHISE_BALANCE`) to Commission Configuration with OTP approval/rejection.
- **Accepted Solution:** All 30 Vitest tests pass; all 3 Playwright E2E journeys pass.

---

## 2. Prompt Execution & Decision Audit Trail

| # | Stage | AI Output / Proposed Solution | Accepted | Rejected | Rationale | Iteration Needed? |
|---|---|---|---|---|---|---|
| 1 | Stage 0/1 - Analysis | Microservice decomposition & OTP topic mapping | Yes | None | Accurately mapped all 126 endpoints across 5 domains | No |
| 2 | Stage 2 - Architecture | 5-layer unidirectional data flow & envelope unwrapping | Yes | Direct Axios calls in UI | Direct network calls in components break testability & separation | No |
| 3 | Stage 3 - State Strategy | Split server state (React Query) from client auth (Zustand) | Yes | Monolithic store | Caching, invalidation, and background re-fetching belong to React Query | No |
| 4 | Stage 3 - OTP Abstraction | `useOtpGuardedAction` 8-state FSM | Yes | Scatter booleans in forms | Ad-hoc booleans cause race conditions and modal glitches | No |
| 5 | Stage 4 - Cascading Selects | `useZoneCircleSSA` with auto-reset cascade | Yes | Manual reset handlers | Parent state change must predictably clear child selections | No |
| 6 | Stage 5 - Server Route Fallback | Native Next.js 15 App Router catch-all route handlers | Yes | External Express mock server on port 3001 | Eliminates CORS preflights, cross-port dependency, and port conflicts | Yes (iterated from 3001 to same-origin) |
| 7 | Stage 5 - RBAC Page Protection | `<PermissionGuard>` on all 5 primary routes | Yes | Nav-only hiding | Direct URL entry without permission guard leaked queries and crashed UI | Yes |
