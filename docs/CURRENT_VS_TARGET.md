# Current State vs Target State

## Why This File Exists

Agents must not treat planned features as already implemented.

This file separates known current behavior from intended target behavior.

---

## Current State

Known current implementation includes:

- Next.js App Router
- TypeScript
- CSS Modules
- Recharts
- Google Sheets integration
- Admin route/dashboard
- Trainer route/dashboard
- login flow
- trainer registration/auth behavior from earlier implementation
- trainer analytics
- admin analytics/monitoring
- Google Sheets as current raw analytics source

The exact current repository must still be inspected before changes.

---

## Target State

Target application includes:

- Superadmin
- Admin
- Trainer
- Trainee
- mutually exclusive user roles
- Neon-backed application persistence
- manually triggered employee sync
- trainee first-login provisioning
- Trainer account creation by Admin
- Admin account creation by Superadmin
- training request workflow
- revision workflow
- approval/rejection
- join token
- participant enrollment
- Trainer-as-participant via Join Training
- Pre-Test
- Post-Test
- remedial
- passing grade
- training completion
- master configuration
- personal trainee history

---

## Migration Rule

Do not replace working current functionality simply because target-state documentation describes a newer design.

Prefer:
- incremental migration
- reusable components
- explicit schema migrations
- compatibility during transition

If current implementation conflicts with target architecture, document the conflict before destructive refactor.
