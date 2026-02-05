# Mini-ATS 🚀

Mini-ATS is a modern, client-heavy SaaS application for Applicant Tracking. Built with Next.js 16 and Supabase, it provides a seamless experience for recruiters to manage job postings and candidates, while offering a smooth application flow for job seekers.

## ✨ Features

### 👤 For Candidates
- **Public Job Board:** View all active job listings from various companies.
- **Easy Application:** Submit applications with contact details and CV uploads (PDF/Word) without needing an account.
- **Company Branding:** Job details pages reflect the company's unique branding and "About Us" information.

### 💼 For Recruiters
- **Self-Service Signup:** Easy registration for new companies.
- **Job Management:** Create and manage job postings with rich descriptions, location, and salary details.
- **Dynamic Kanban Board:** Track candidate progress through customizable recruitment steps.
- **Settings & Customization:**
  - **Recruitment Steps:** Tailor the hiring pipeline with drag-and-drop step management.
  - **Company Profile:** Manage branding, logos, and company descriptions.
  - **Job Templates:** Save time with reusable job description templates.

### 🔑 For Admins
- **Global Management:** Oversee all companies and users from a central admin panel.
- **Impersonation Mode:** Seamlessly switch views to see the platform as any specific company for support and management.

### 🎨 Design & UX
- **Multi-Theme Support:** Choose between three modern themes using OKLCH colors:
  - **Indigo:** Professional dark mode.
  - **Bright:** Clean and minimalist light mode.
  - **Vibrant:** Energetic and colorful.
- **Responsive Design:** Fully functional across desktop and mobile devices.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui.
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **State Management:** React Query for efficient server state handling.
- **Theming:** `next-themes` with custom OKLCH color palettes.
- **Data Security:** Row Level Security (RLS) and Edge Runtime proxies for robust authorization.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mini-ats
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
1. Run the migration files located in `supabase/migrations/` in your Supabase SQL Editor to set up the schema, RLS policies, and functions.
2. Ensure you have the `cvs` bucket created in Supabase Storage.

### Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 Architecture

- **Authentication:** Managed via Supabase SSR with cross-platform session persistence.
- **Authorization:** Handled through Supabase RLS and `proxy.ts` (Edge Runtime).
- **CV Storage:** Supabase Storage (`cvs` bucket) for candidate documents.
- **Application Flow:** Atomic `submit_application` RPC function for RLS-safe public applications.
- **Admin Impersonation:** Global `AdminProvider` with `localStorage` persistence.

## 📁 Project Structure

```text
app/            # Next.js App Router (Admin, Dashboard, Jobs, etc.)
components/     # Shared UI and feature-specific components
src/
  hooks/        # React Query custom hooks
  lib/          # Supabase client and shared utilities
  providers/    # Context providers (Auth, Admin, Query)
supabase/
  migrations/   # SQL migration files
```

---
Built with ❤️ by the Mini-ATS Team.