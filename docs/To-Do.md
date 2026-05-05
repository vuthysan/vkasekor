---
title: Project To-Do List
tags:
  - tasks
  - planning
---

# VKasekor: Master To-Do List

> [!abstract] Project Status
> **Backend**: Core API & Rules Engine established. Multi-asset support implemented.
> **Frontend**: Initialized, awaiting component development.

---

## ⚙️ Backend Path (API & Engine)

> [!success] Phase 1: Core Engine Completed
> The foundational logic and database schema are already built and tested.

- [x] Set up Bun + Hono REST API.
- [x] Connect to MongoDB and define schemas (Zod).
- [x] Build the **Rules Engine** (`matchingRulesForAge`).
- [x] Implement **Multi-Asset Support** (Chickens, Pigs, Vegetables).
- [x] Build the Daily Cron Job to calculate ages and schedule alerts.
- [x] Create the dynamic Khmer Telegram message formatter.
- [x] Seed the database with initial MAFF agricultural rules.
- [x] Create Auth routes for Telegram Login payload verification.
- [ ] Implement pagination/filtering for `/api/assets` endpoint (If needed later).

---

## 🖥️ Frontend Path (Web Dashboard)

> [!info] Phase 2: User Interface Development
> We are currently focusing on building the farmer's management dashboard.

### 1. Infrastructure & Layout
- [ ] Initialize standard UI libraries (Tailwind, Shadcn UI, Lucide icons).
- [ ] Set up the global application layout (`dash/app/layout.tsx`).
- [ ] Build the `Sidebar` navigation component.
- [ ] Build the Top `Header` component.
- [ ] Create the Dashboard Layout wrapper (`dash/app/dashboard/layout.tsx`).

### 2. Core UI Components (Dashboard Patterns)
- [ ] Build the `StatCard` widget (for displaying total assets, pending alerts).
- [ ] Integrate **TanStack Table** library.
- [ ] Build the `DataTable` component for listing batches.
- [ ] Build Skeleton loading states for the dashboard grid to prevent layout shift.

### 3. API Integration & Assembly
- [ ] Install and configure **TanStack Query** for data fetching.
- [ ] Create API fetching functions to connect to the Hono backend (`GET /api/assets`).
- [ ] Assemble the Main Dashboard Page (`dash/app/dashboard/page.tsx`).
- [ ] Populate `StatCard`s with real data.
- [ ] Populate the `DataTable` with real batch data.

### 4. Batch Registration Flow
- [ ] Build the "Register New Batch" form component.
- [ ] Implement Zod validation for the form (Breed, Quantity, Arrival Date).
- [ ] Create the `POST /api/assets` integration.
- [ ] Add success/error toast notifications.
- [ ] Ensure the dashboard automatically refreshes after a new batch is registered.

### 5. Authentication (Telegram)
- [ ] Integrate the Telegram Login Widget on the landing page.
- [ ] Implement HTTP-only cookie session management on the client.
- [ ] Protect dashboard routes using Next.js middleware.
