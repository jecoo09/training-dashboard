# AGENTS.md — TND 2026 Dashboard Agent Guidelines

## 1. Purpose

This repository contains the **TND 2026 Dashboard**, a desktop-focused internal training management web application.

The application is being upgraded from an analytics-focused dashboard into a role-based training management system with four mutually exclusive application roles:

- `superadmin`
- `admin`
- `trainer`
- `trainee`

A user's application role controls access and navigation.  
Training participation is modeled separately from role, so a Trainer may still join another training as a participant through the **Join Training** flow.

Before making any non-trivial change, read the relevant documents in `/docs`.

---

## 2. Required Reading Order

For architecture or feature work, read:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/BUSINESS_RULES.md`
3. `docs/RBAC.md`
4. `docs/DATABASE.md`
5. `docs/AUTH_AND_SYNC.md`
6. `docs/ARCHITECTURE.md`
7. `docs/ROADMAP.md`

Do not assume a feature is implemented just because it appears in target-state documentation.

Always distinguish:

- **Current State** = what already exists in the repository
- **Target State** = what the application is intended to become

---

## 3. Tech Stack

Current intended stack:

- **Framework**: Next.js, App Router
- **Language**: TypeScript
- **Styling**: CSS Modules + global reset
- **Charts**: Recharts
- **Database**: Neon PostgreSQL
- **External Data Source**: Google Sheets API via Google Cloud Service Account
- **Deployment**: Vercel
- **Authentication**: cookie-based session, server-side authentication
- **Employee Master Source**: Google Sheets
- **Application Data Source of Truth**: Neon PostgreSQL

Do not move application-state persistence into Google Sheets.

---

## 4. Core Domain Separation

Never merge these concepts:

### Employee
Represents the person and company master data.

Examples:
- NIK
- name
- date of birth
- location
- position
- active status

### User
Represents application access.

Examples:
- employee reference
- role
- password hash
- login state
- account status

### Role
Represents authorization.

Exactly one role per user:
- superadmin
- admin
- trainer
- trainee

### Training Participant
Represents participation in a training.

Participation does **not** depend on application role.

Example:
A user with `role = trainer` may still participate in another training.

---

## 5. Role Rules

### Superadmin
May:
- do everything Admin can do
- create Admin accounts
- manage master training configuration
- manage work areas
- manage training names
- manage program training list
- map training names to training programs
- configure default training hours per training program
- trigger employee synchronization from Google Sheets

Cannot:
- submit training requests
- reset another user's password through the admin UI

### Admin
May:
- login
- monitor all training activity
- view all training data
- create Trainer accounts
- approve training requests
- reject training requests
- request revision
- inspect participant scores and training details

Cannot:
- submit training requests
- edit Trainer submissions directly after submission
- reset another user's password through the admin UI

### Trainer
May:
- login
- view existing trainer dashboard
- submit training requests
- manage own training requests before approval
- request a date change after approval
- open and close Pre-Test
- open and close Post-Test
- open remedial sessions
- end a training
- monitor own trainings
- view participant scores
- join another training as participant through `Join Training`

### Trainee
May:
- login
- enter a training token
- join eligible training
- complete Pre-Test
- complete Post-Test
- complete remedial attempts
- view personal training history
- view personal profile

---

## 6. Critical Guardrails

- Do not implement multi-role accounts.
- Do not make `role` determine whether an employee can participate in a training.
- Do not delete historical employees when they disappear from Google Sheets.
- Do not store raw passwords.
- Do not use Google Sheets as the application database.
- Do not let Admin/Superadmin submit training requests.
- Do not let Trainer edit an approved training except through the defined date-change request flow.
- Do not let trainees see test scores immediately after submission.
- Do not overwrite existing analytics behavior unless explicitly required.
- Do not refactor unrelated working code while implementing a feature.
- Do not change database schema casually. If schema change is needed, explain the migration impact first.
- Never commit `.env.local`, credentials, Google service-account keys, or secrets.

---

## 7. Development Workflow

Before coding a non-trivial task:

1. Identify affected files.
2. Explain current implementation.
3. State whether the task changes current state or target state.
4. Identify relevant business rules.
5. Identify database impact.
6. Identify regression risks.
7. Implement only the requested scope.
8. Run lint/build/tests if available.
9. Report what changed.

If documentation conflicts with actual implementation, report the mismatch instead of silently choosing one.

---

## 8. Commands

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run lint`

---

## 9. UX Direction

The application is desktop-focused.

General rules:
- compact layouts
- no horizontal overflow
- role-specific navigation
- Trainer and Trainee participant experiences may share components
- Admin/Superadmin interfaces prioritize monitoring and operations over decoration

Current color direction may be retained unless a redesign is explicitly requested.
