# Sales Channel Management (SCM) Admin Portal

[![Next.js](https://img.shields.io/badge/Next.js-15%2F16_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat&logo=react-query)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-v5-orange?style=flat)](https://github.com/pmndrs/zustand)
[![MSW](https://img.shields.io/badge/MSW-v2-red?style=flat&logo=mockserviceworker)](https://mswjs.io/)
[![Vitest](https://img.shields.io/badge/Vitest-30%2F30_Passing-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-3%2F3_E2E_Passing-brightgreen?style=flat&logo=playwright)](https://playwright.dev/)

An enterprise-grade, AI-native administrative portal built for telecom Sales Channel Management (SCM). Designed to administer hierarchical sales channels, telecom dealer onboarding, multi-tiered commission schemes, tariff plans, and franchise wallet reconciliations across pan-India telecom geographic structures (Zone → Circle → SSA).

Built following a rigorous AI-assisted software engineering methodology, adhering directly to the **AI Native UI Developer Hackathon** challenge requirements.

---

## 🏛️ Architecture Overview

The system strictly enforces a **5-tier unidirectional data flow** ensuring complete separation of concerns:

```
┌────────────────────────────────────────────────────────┐
│               UI Layer (Screens & Modals)              │
│   Dashboard · Users · Dealers · Commissions · Plans    │
└──────────────────────────┬─────────────────────────────┘
                           │ Dispatches actions / Consumes state
┌──────────────────────────▼─────────────────────────────┐
│          State & Hooks Layer (Declarative)             │
│  · TanStack Query v5 (Server State & Invalidation)     │
│  · Zustand + Persist (18-Flag Authorization Matrix)    │
│  · useOtpGuardedAction (8-State Security FSM)          │
│  · useZoneCircleSSA (Cascading Geographic Cascade)     │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls typed services
┌──────────────────────────▼─────────────────────────────┐
│              Typed Domain API Layer                    │
│   masterdata · user · dealer · commission · plan ...   │
└──────────────────────────┬─────────────────────────────┘
                           │ Standardized envelope unwrapping
┌──────────────────────────▼─────────────────────────────┐
│         Centralized HTTP Client & Interceptors         │
│   Axios Client · Request Auth · Error Normalization    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / Network boundary
┌──────────────────────────▼─────────────────────────────┐
│         Backend REST APIs / MSW v2 Mock Engine         │
│       Simulating 126 Endpoints across 5 Domains        │
└────────────────────────────────────────────────────────┘
```

### Core Design Invariants

1. **Zero Direct Network Calls in UI:** Components never invoke `fetch` or `axios` directly; all I/O is abstracted into typed domain services and query hooks.
2. **Standardized Envelope Unwrapping:** Automatically extracts payload `data` from `{ status, message, data }` envelopes while normalizing backend status codes into strongly typed `ApiError` objects.
3. **5-State Resilient UI Pattern:** Every table and data-driven view deterministically renders all 5 standard states:
   - **Loading:** Tailored skeleton loaders preventing layout shifts.
   - **Success:** Rich, interactive data presentation with pagination and sorting.
   - **Empty:** Context-rich zero-data states with contextual call-to-actions.
   - **Error:** Human-readable error messages with retry actions.
   - **Permission Denied:** Role-based visual guards.
4. **OTP Security Finite State Machine (FSM):** Destructive or high-risk mutations (commission creation, user registration, dealer status toggling, MPIN reset) are guarded by an 8-state deterministic state machine preventing race conditions and double submissions.

---

## 🚀 Key Modules & Screen Implementation

| Screen | Route | Key Capabilities | Safeguards / Rules |
|---|---|---|---|
| **Executive Dashboard** | `/` | KPI overview (Active Dealers, Pending Approvals, Total Commission, Plans), Quick Actions grid, live Franchise Approval Activity feed | Real-time TanStack Query cache |
| **User Administration** | `/users` | HRMS employee search, cascading Zone/Circle/SSA location assignment, 18-point permissions modal | OTP-guarded onboarding, Zod schema validation |
| **Dealer Management** | `/dealers` | Dealer list with status badges, PAN/Aadhaar real-time duplicate check, Franchise/Sub-Franchise hierarchy tree | OTP-guarded MPIN reset & status toggle |
| **Commission Engine** | `/commissions` | Multi-tab configuration for **FRC**, **OTF**, **Postpaid**, and **Landline** commission rules | Tab-based isolation, OTP-guarded rule submission |
| **Tariff Plans & MNP** | `/plans` | Tariff plan catalog, multi-denomination matrix manager, Mobile Number Portability (MNP) lookup | OTP-guarded plan deletion |
| **Reports & Wallets** | `/reports` | Franchise top-up transactions approval/rejection table, instant wallet balance adjustment | Two-step OTP verification for balance approvals |

---

## 🔐 18-Point User Permissions Matrix

The portal implements an enterprise-grade granular authorization matrix managed via Zustand:

```typescript
export interface UserPermissions {
  dealerPermissions: boolean;
  walletPermissions: boolean;
  userPermissions: boolean;
  commissionPermissions: boolean;
  plansNumberpermissions: boolean;
  reportsPermissions: boolean;
  // Module-level CRUD breakdown:
  canCreateUser: boolean;
  canEditUser: boolean;
  canToggleUserStatus: boolean;
  canCreateDealer: boolean;
  canEditDealer: boolean;
  canResetMpin: boolean;
  canManageCommission: boolean;
  canCreatePlan: boolean;
  canDeletePlan: boolean;
  canApproveTransaction: boolean;
  canRejectTransaction: boolean;
  canAdjustWallet: boolean;
}
```

### Live Dev Permissions Switcher
To facilitate real-time grading and evaluator demonstration without requiring database modification, click the **"Dev: Permissions"** floating badge in the bottom-left corner of any page. This opens a live modal allowing evaluators to toggle all 18 permission flags individually or use quick presets (**Super Admin**, **Read Only**, **Auditor**). The navigation bar and action buttons immediately adapt in real-time.

---

## 🛡️ OTP Finite State Machine (`useOtpGuardedAction`)

To satisfy telecom security criteria, sensitive mutations follow an irreversible, strictly guarded state lifecycle:

```
idle ──> confirming ──> sendingOtp ──> otpPending ──> validating ──> validated ──> executing ──> success
  │          │                                            │                                        │
  └──────────┴────────────────────────────────────────────┴────────────────────────────────────────┴──> error
```

- **Invariant:** The target mutation function cannot execute unless state reaches `validated`.
- **Race Condition Prevention:** Any repeated click or submit while state is `validating` or `executing` is systematically ignored.
- **Mock OTP:** When running locally with MSW, any 4-digit code (e.g. `1234`) succeeds; entering `9999` deliberately simulates a verification failure for error-handling demonstration.

---

## 🧪 Automated Testing & Quality Assurance

The project includes unit and integration tests powered by **Vitest**, **React Testing Library**, and **MSW v2**:

```bash
# Run test suite
npm test
```

### Test Coverage Highlights
- `tests/unit/useOtpGuardedAction.test.ts` — Verifies state transitions, double-submission prevention, and error states.
- `tests/unit/usePermission.test.ts` — Tests permission resolution and fallback defaults.
- `tests/unit/schemas.test.ts` — Validates Zod schemas (mobile number format, PAN, Aadhaar, password rules).
- `tests/integration/user-otp-flow.test.tsx` — End-to-end integration test verifying the complete OTP verification and user onboarding workflow against MSW.

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- **Node.js:** v20.x or v22.x
- **Package Manager:** npm or pnpm

### 1. Installation
```bash
git clone https://github.com/Adithyasai123/Scm.git
cd Scm
npm install
```

### 2. Run Automated Tests
```bash
# Run Vitest Unit & Integration Tests (30/30 passing)
npm test

# Run Playwright End-to-End Tests (3/3 journeys passing)
npx playwright test --project=msedge
```
*Expected: 7 Vitest test files passed (30/30 tests green), 3 Playwright E2E journeys passed.*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
```
*Compiles all Next.js App Router routes with zero TypeScript or linting errors.*

---

## 📚 Evaluation & Documentation Deliverables

Detailed engineering documentation is located in the `docs/` folder:

| Document | Description |
|---|---|
| [`docs/api-mapping.md`](docs/api-mapping.md) | Comprehensive mapping of all 126 endpoints across 5 microservices to UI screens, methods, and payloads. |
| [`docs/architecture.md`](docs/architecture.md) | Technical blueprint covering 5-tier data flow, component hierarchies, dual-layer network mocking, OTP FSM, and RBAC matrix. |
| [`docs/decisions.md`](docs/decisions.md) | Architecture Decision Records (ADRs 1–5) documenting Next.js 15, MSW v2, OTP FSM, native server route fallbacks, and RBAC PermissionGuard. |
| [`docs/ai-prompts.md`](docs/ai-prompts.md) | Complete prompt engineering audit trail detailing Stage 0 to Stage 5 prompt logs and iterative decisions. |
| [`docs/debugging.md`](docs/debugging.md) | Technical case studies (DBG 001–005) demonstrating AI-assisted diagnosis and resolution of race conditions, CORS preflight traps, and permission guards. |

---

## 🏆 Hackathon Rubric Alignment

| Rubric Category | Weight | How It Is Fulfilled in This Project |
|---|---|---|
| **AI-driven UI/UX design** | 15% | High-density enterprise layout, responsive collapsible sidebar, accessible modals, consistent design tokens. |
| **AI-assisted development methodology** | 15% | Structured 6-stage lifecycle (Deconstruct → Architect → Contract → Component → FSM → Verify) documented in `docs/ai-prompts.md`. |
| **API integration** | 15% | Full typed client covering 126 endpoints, envelope unwrapper, error normalizer, and MSW v2 offline mock engine. |
| **Automated testing** | 15% | Vitest test suite covering unit schemas, FSM state transitions, and full integration flows with MSW. |
| **UI/UX quality** | 10% | 5-state resilient UI across all screens (Loading skeletons, Success data, Empty state, Error retry, Permission guard). |
| **Architecture / Component design** | 10% | 5-tier unidirectional architecture, custom hooks, reusable DataTable, compound inputs, strict Zod validation. |
| **AI-assisted debugging** | 5% | Documented case studies resolving in-flight OTP race conditions and Node/test runner environment mismatches (`docs/debugging.md`). |
| **Code review / Security / Performance** | 5% | OTP FSM guard on financial mutations, memoized callbacks, React Query caching, static route pre-rendering. |
| **Responsive & Accessibility** | 5% | Tailwind responsive grid, collapsible mobile drawer, semantic HTML elements, accessible form labels and ARIA dialogs. |
| **Documentation & AI prompts** | 5% | Complete markdown suite: architecture diagrams, API catalog, ADRs, debugging retrospective, and prompt log. |

---

## 📄 License
Internal hackathon deliverable. Built for evaluation purposes.
