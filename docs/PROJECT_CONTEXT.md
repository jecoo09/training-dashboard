# Project Context

## 1. Project Name

**TND 2026 Dashboard**

Internal web application for managing training operations, trainer activity, employee participation, assessments, and training monitoring.

---

## 2. Current State

The existing application already includes:

- Next.js App Router
- TypeScript
- CSS Modules
- Recharts
- Google Sheets integration
- Admin dashboard
- Trainer dashboard
- login flow
- basic role-aware behavior
- historical training analytics sourced from Google Sheets

The existing Trainer dashboard should be preserved where possible.

The project is now being expanded into a broader training-management platform.

---

## 3. Target State

The final application supports four mutually exclusive roles:

- Superadmin
- Admin
- Trainer
- Trainee

The platform manages:

- employee master synchronization
- authentication
- account provisioning
- trainer management
- training request submission
- approval/rejection/revision
- training participant access via token
- Pre-Test
- Post-Test
- remedial
- training history
- training monitoring
- configuration master data
- legacy/historical analytics

---

## 4. Core Training Submission Data

A Trainer submits:

- training name/title
- execution date
- work area
- internal/external classification
- trainer list
- whether Pre-Test/Post-Test is used

Trainer rules:

- submitting Trainer is automatically Trainer 1
- Trainer 1 may be changed during draft/submission preparation
- additional Trainers are selected from Trainer accounts
- an `Other` option may be used for manually entered external/other trainer names

---

## 5. Training Lifecycle

Main status flow:

`Pending -> Approved -> Completed`

Alternative flows:

`Pending -> Rejected`

`Pending -> Canceled`

Optional revision flow:

`Pending -> Revision Requested -> Pending`

Rules:

- Trainer may cancel their own request before completion of approval flow.
- After approval, the Trainer may not freely edit the training.
- After approval, only a date-change request may be submitted.
- Admin/Superadmin may approve, reject, or request revision.
- Admin/Superadmin may not directly edit the Trainer's submitted content.

---

## 6. Participant Flow

After a training is approved:

1. Training receives a join token.
2. Trainer sees the token in Training Detail.
3. Trainer shares the token with participants.
4. Participant logs into the application.
5. Participant enters the token.
6. Participant joins the training.
7. Trainer starts Pre-Test if applicable.
8. Participant completes Pre-Test.
9. Training takes place.
10. Trainer starts Post-Test.
11. Participant completes Post-Test.
12. Participants below passing score enter remedial flow.
13. Trainer ends the training.
14. Training becomes Completed.

---

## 7. Trainer Participation

A Trainer may participate in another training without changing role.

A Trainer has a dedicated page:

`Join Training`

This page reuses the participant experience used by Trainee users.

Therefore:

- `role = trainer` remains unchanged
- participation is stored through training-participant records
- trainee UI components should be designed for reuse where practical

---

## 8. Historical Data

Google Sheets continues to contain historical training data used by current Admin and Trainer analytics.

Historical data does not need to be reconstructed into personal trainee history unless a reliable mapping exists.

Trainee personal training history should primarily reflect training recorded by the new application.

---

## 9. Must-Have Scope

The following are mandatory:

- Superadmin
- Admin
- Trainer
- Trainee
- authentication
- employee sync
- Trainer account creation
- Admin account creation
- training submission
- training approval
- revision request
- training token
- participant joining
- Pre-Test
- Post-Test
- remedial
- passing status
- training history
- training monitoring
- role-based dashboards
- master configuration

Nice-to-have:
- certificate
- notifications
