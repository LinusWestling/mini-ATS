# Mini-ATS 🚀

Mini-ATS is a modern, high-security SaaS application for Applicant Tracking. Built with Next.js 16 and Supabase, it provides a robust platform for recruiters to manage the entire hiring lifecycle—from Kravprofil and AI-assisted job ads to structured interviews and candidate comparison.

## ✨ Features

### 👤 For Candidates & Public
- **Public Job Feed:** Browse active openings across all companies without logging in.
- **Seamless Application:** Direct apply flow with contact details and CV uploads (PDF/Word).
- **Branded Experience:** Job pages adapt to the hiring company's visual identity.

### 💼 For Recruiters (BFF Architecture)
- **Unified Workflow:** 6-step recruitment wizard (Kravprofil -> Job Ad -> Automation -> Team -> Notifications -> Interviews).
- **Structured Interviews:** Design interview templates, log scores, and generate candidate comparisons.
- **Dynamic Kanban:** Manage candidates with drag-and-drop ease through custom recruitment steps.
- **Secure Onboarding:** Self-service company registration and secure team invitation system.

### 🔑 For Admins
- **Global Control:** Centralized management of all companies, users, and global data.
- **Admin View-As:** Impersonation capabilities to view and manage the platform as any specific company.

## 🛡️ Security & Architecture

The project follows a **Backend for Frontend (BFF)** pattern to maximize security and data integrity:

- **Next.js API Routes:** All data mutations and sensitive fetches pass through a server-side API layer (`app/api/`).
- **Input Validation:** Robust schema validation using **Zod** on all POST/PUT operations to prevent injection and mass-assignment.
- **Identity Forwarding:** API routes utilize `createServerClient` (Supabase SSR) to forward user sessions, ensuring Row Level Security (RLS) remains the primary firewall.
- **Tenant Isolation:** Automatic company-scoping at both the API and Database levels.
- **Public Read Access:** Explicitly enabled for Job Posts to support the public board, while keeping internal data (Interviews, Candidates, etc.) strictly private.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui.
- **Backend:** Supabase (Postgres, Auth, Storage, RLS).
- **State Management:** React Query (Server State) & Custom Hooks (Data Layer).
- **Validation:** Zod (Schema-based validation).
- **Theming:** `next-themes` with custom OKLCH color palettes (Indigo, Bright, Vibrant).

## 📁 Project Structure

```text
app/
  api/          # Backend logic (BFF Pattern)
  dashboard/    # Recruiter main interface
  admin/        # Global admin panel
  jobs/         # Public job board and application flow
src/
  hooks/        # API-consuming hooks (Middle Layer)
  lib/
    validation/ # Zod Schemas
    supabase/   # Server & Client configurations
  providers/    # Auth, Admin, and Query contexts
supabase/
  migrations/   # SQL Schema & RLS Policies
```

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Setup .env**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. **Database**: Run migrations in `supabase/migrations/` in order.
4. **Development**: `npm run dev`

---
Built for performance, security, and developer productivity.
