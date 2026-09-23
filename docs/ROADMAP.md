# Upgrade Roadmap

## Principle

Do not implement the entire target system in one Codex task.

Upgrade in controlled phases.

Each phase should:
- preserve working functionality
- include schema migrations if needed
- pass build/lint
- avoid unrelated refactors

---

## Phase 0 — Documentation and Audit

Goals:
- add project documentation
- inspect current repository
- map existing routes/components/data flow
- identify reusable Admin/Trainer dashboard code
- identify auth limitations
- identify current Google Sheets integration

Deliverable:
- implementation gap report

---

## Phase 1 — Database Foundation

Implement:
- employees
- users
- work_areas
- training_programs
- training_names
- sync_logs

Add:
- migrations
- indexes
- role enum
- status enums

Do not implement training workflow yet.

---

## Phase 2 — Employee Sync

Implement Superadmin employee sync:

- Google Sheets fetch
- validation
- normalization
- diff
- preview
- suspicious-change warning
- insert/update/deactivate
- sync logging

UI:
- Employee Management
- last sync
- result summary

---

## Phase 3 — Authentication and RBAC

Implement:
- Superadmin seeded account
- Admin login
- Trainer login
- Trainee first-login provisioning
- role redirect
- protected routes
- server-side authorization

Do not rely only on client route guards.

---

## Phase 4 — User Management

Implement:

Superadmin:
- create Admin
- manage Admin state

Admin/Superadmin:
- create Trainer
- search employee
- convert existing Trainee user to Trainer without losing history

---

## Phase 5 — Master Configuration

Superadmin manages:
- work areas
- training programs
- training names
- training -> program mapping
- default training hours

---

## Phase 6 — Training Submission

Trainer:
- My Trainings page
- New Training page
- training form
- multiple Trainers
- internal/external
- has assessment
- cancel request

Status:
- pending
- canceled

---

## Phase 7 — Approval Workflow

Admin/Superadmin:
- approval queue
- approve
- reject
- request revision

Trainer:
- revision response

After approval:
- lock normal editing
- allow date-change request only

---

## Phase 8 — Join Token and Participants

Implement:
- unique training token
- token display
- Trainee Join Training
- Trainer Join Training
- participant enrollment
- duplicate-participant prevention

Reuse participant UI across Trainer and Trainee.

---

## Phase 9 — Assessment Question Management

If assessment enabled:

Implement:
- template selection
- CSV/XLSX upload
- upload validation
- question preview
- per-training question storage
- multiple-choice questions only

---

## Phase 10 — Assessment Engine

Implement:
- Pre-Test session
- Post-Test session
- Trainer open/close controls
- shuffled question order
- shuffled answer order
- 1 minute per question
- server-enforced attempt counts
- scoring

Attempts:
- Pre: 1
- Post: 1

---

## Phase 11 — Remedial

Implement:
- passing grade 90
- remedial eligibility
- max 3 remedial attempts
- Trainer remedial controls
- final passing status

---

## Phase 12 — Training Completion

Trainer:
- End Training

System:
- lock sessions
- finalize participant status
- set Completed
- preserve result history

---

## Phase 13 — Trainee Experience

Implement:
- Trainee home
- token input
- active training cards
- history
- profile
- detailed personal analytics/history

---

## Phase 14 — Trainer Participant Experience

Implement/refine:
- Join Training page
- participant-mode training view
- personal participation history if required

Keep Trainer operational pages separate from participant mode.

---

## Phase 15 — Admin/Superadmin Monitoring

Connect new transactional data to monitoring.

Support:
- training list
- participant detail
- score detail
- Trainer filters
- status filters

Preserve useful existing analytics.

---

## Phase 16 — Production Hardening

Implement/review:
- rate limiting
- audit logging
- error handling
- sync safeguards
- security headers
- cookie configuration
- indexes
- backup strategy
- production env validation
- test coverage

---

## Nice-to-Have Phase

Later:
- certificates
- notifications
- email OTP
- password reset
- richer audit logs
