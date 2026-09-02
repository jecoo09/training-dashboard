# AGENTS.md - Developer & Agent Guidelines

## 1. Project Overview
This repository contains the **TND 2026 Dashboard**, a desktop-focused web application built with Next.js (App Router). The system is now structured into two role-based flows:

- **Admin route**: `/admin` for admin analytics and compact operational monitoring
- **Trainer route**: `/` for trainer login, profile dashboard, and per-trainer analytics

The app reads training dataset ranges from Google Sheets using a Service Account, while authentication for trainer access is validated against a local session plus a Neon-ready user store. Google Sheets remains the validation source for trainer eligibility during registration.

## 2. Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (`*.module.css`) + Global Reset
- **Charts**: Recharts
- **Data Source**: Google Sheets API (`googleapis`)
- **Auth Model**: Cookie-based session with role-based access control
- **Persistence**: Neon-ready JSON-backed user store for local development, with a path to Postgres migration

---

## 3. Role-Based UX & Color System

### Neutral Base
- **Background Base**: `#FAFAFA`
- **Card / Container**: `#FFFFFF`
- **Text Primary**: `#1C1917`
- **Shared Accent**: `#E65100` / `#F57C00`

### Trainer Experience
- **Primary Accent**: `#F97316`
- **Secondary Accent**: `#FDBA74`
- **Usage**: login, dashboard cards, pie chart, and trainer-only CTA actions

### Admin Experience
- **Primary Accent**: `#111827`
- **Secondary Accent**: `#F97316`
- **Usage**: compact analytics, action buttons, and monitoring cards

---

## 4. Current Implementation Status
- **Admin Route**: dedicated `/admin` page with compact KPI layout and logout button
- **Trainer Route**: root route `/` is now a protected trainer dashboard with sidebar profile, filters, KPI cards, pie chart, monthly recap, and program analytics
- **Authentication**: admin login with email/password and trainer login with NIK/password
- **Trainer Registration**: NIK is auto-uppercase, validated against the trainer master list, and stored after successful password confirmation
- **Password Recovery**: for MVP, a clear admin-driven reset flow is in place; email verification can be introduced later when the business is ready
- **Data Validation**: trainer registration is blocked if the NIK is not found in the approved trainer data source

---

## 5. Dev Workflow
### Route Logic
- `/login` handles both admin and trainer login
- `/register` handles trainer sign-up
- `/admin` is protected for admin users only
- `/` is protected for trainer users only

### Session Rules
- Session cookie name: `tnd_auth`
- Roles supported: `admin` and `trainer`
- Auth checks are performed on the client route before rendering protected pages

### Data Rules
- Google Sheets continues to be the source for raw trend data and trainer validation
- Neon is treated as the app persistence layer for auth-aware records and future scalability
- Trainer NIKs are normalized with uppercase, trimmed alphanumeric text before validation

---

## 6. Guardrails
- Keep `/admin` and `/` visually separated and role-specific
- Maintain a compact, desktop-first layout without causing horizontal overflow
- Never commit `.env.local` or service credentials
- Shared trainer names separated by commas must still be recognized and credited correctly
- When ready for production, replace the local JSON auth store with a proper Neon/Postgres table design

---

## 7. Essential Commands
- **Run Dev Server**: `npm run dev`
- **Build Application**: `npm run build`
- **Start Production**: `npm start`
- **Run Linter**: `npm run lint`