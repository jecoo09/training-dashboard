# Architecture

## 1. High-Level Architecture

```text
                   Google Sheets
             Employee Master + Legacy Data
                        |
                        |
              Manual Superadmin Sync
                        |
                        v
                Neon PostgreSQL
                  Application DB
                        |
                        v
                  Next.js App
                        |
         +--------------+--------------+
         |              |              |
      Browser        API/Server      Auth
```

---

## 2. Data Ownership

### Google Sheets owns
- employee master input
- legacy training datasets used by existing analytics

### Neon owns
- users
- roles
- training requests
- approvals
- participants
- tokens
- assessment questions
- sessions
- attempts
- scores
- remedials
- master configuration
- sync logs

---

## 3. Server Boundaries

Sensitive operations must execute server-side:

- login
- password verification
- RBAC
- Google Sheets sync
- training approval
- token validation
- question upload processing
- assessment scoring
- attempt enforcement
- assessment session state changes

Do not trust client-provided role or score values.

---

## 4. Recommended Application Layers

Suggested separation:

```text
app/
  login/
  admin/
  superadmin/
  trainer/
  trainee/

lib/
  auth/
  db/
  google-sheets/
  permissions/
  training/
  assessments/

components/
  shared/
  admin/
  trainer/
  participant/
```

Exact structure may follow existing repository conventions.

---

## 5. Participant Experience Reuse

Trainee and Trainer-as-participant should share participant components.

Examples:

```text
components/participant/
  JoinTrainingForm
  TrainingParticipantCard
  AssessmentWaitingState
  AssessmentRunner
  TrainingHistoryCard
```

Trainer `Join Training` should reuse these components rather than duplicating the flow.

---

## 6. Assessment Shuffle

Canonical question records remain unchanged.

For each attempt:

- generate randomized question order
- generate randomized answer-option presentation
- retain enough mapping to score correctly

Do not mutate correct-answer data during shuffle.

---

## 7. Test Timer

Timer is derived from number of questions:

`duration_minutes = question_count`

Server should record:
- start time
- expected expiration
- submit time

Client countdown alone is not authoritative.

---

## 8. Session Security

Recommended cookie properties:

- HttpOnly
- Secure in production
- SameSite=Lax or stricter where compatible
- appropriate expiration

RBAC checks should run on protected server boundaries.

---

## 9. Analytics

Existing Admin and Trainer analytics should be preserved where practical.

Legacy Google Sheets analytics may coexist with new transactional application data.

Avoid forcing an immediate migration of all historical analytics into Neon unless needed.

---

## 10. Production Direction

The current stack is valid:

- Next.js
- Neon
- Vercel
- Google Sheets API

A full rewrite is not required solely because requirements have expanded.

Prefer controlled migration/refactor by domain unless the existing codebase proves structurally incompatible.
