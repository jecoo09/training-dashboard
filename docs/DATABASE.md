# Database Design

## 1. Database Principle

Neon PostgreSQL is the source of truth for application data.

Google Sheets is the source of truth for company employee master data and legacy analytics data.

Do not use Google Sheets as the transactional database.

---

## 2. Employees

Suggested table:

```sql
employees
---------
id uuid primary key
nik varchar unique not null
name varchar not null
birth_date date
location_id uuid nullable
position varchar nullable
is_active boolean default true
source varchar default 'google_sheets'
last_synced_at timestamptz
created_at timestamptz
updated_at timestamptz
```

Purpose:
- company identity
- employee master data
- historical ownership anchor

Training history should reference `employee_id`, not user role.

---

## 3. Users

Suggested table:

```sql
users
-----
id uuid primary key
employee_id uuid unique nullable
role enum(superadmin, admin, trainer, trainee)
password_hash varchar not null
is_active boolean default true
must_change_password boolean default false
last_login_at timestamptz
created_at timestamptz
updated_at timestamptz
```

Notes:
- exactly one role
- trainee user may be provisioned lazily at first login
- Trainer/Admin accounts are explicitly created
- Superadmin is seeded

---

## 4. Work Areas

```sql
work_areas
----------
id uuid primary key
name varchar unique not null
is_active boolean default true
```

Managed by Superadmin.

---

## 5. Training Programs

```sql
training_programs
-----------------
id uuid primary key
name varchar unique not null
default_training_hours numeric
is_active boolean default true
```

Managed by Superadmin.

---

## 6. Training Names

```sql
training_names
--------------
id uuid primary key
name varchar unique not null
program_id uuid references training_programs(id)
is_active boolean default true
```

Managed by Superadmin.

---

## 7. Trainings

Suggested table:

```sql
trainings
---------
id uuid primary key
training_name_id uuid nullable
custom_title varchar nullable
execution_date date not null
work_area_id uuid not null
delivery_type enum('internal', 'external')
has_assessment boolean default false
status enum(
  'pending',
  'revision_requested',
  'approved',
  'rejected',
  'canceled',
  'completed'
)
join_token varchar unique nullable
submitted_by_user_id uuid not null
approved_by_user_id uuid nullable
approved_at timestamptz nullable
ended_at timestamptz nullable
created_at timestamptz
updated_at timestamptz
```

---

## 8. Training Trainers

Supports multiple trainers.

```sql
training_trainers
-----------------
id uuid primary key
training_id uuid not null
trainer_user_id uuid nullable
external_trainer_name varchar nullable
trainer_order integer
```

Rules:
- Trainer 1 is derived from submission by default
- external/manual trainers may not have a user account

---

## 9. Revision Requests

```sql
training_revisions
------------------
id uuid primary key
training_id uuid not null
requested_by_user_id uuid not null
message text
status enum('open', 'resolved')
created_at timestamptz
resolved_at timestamptz nullable
```

---

## 10. Date Change Requests

```sql
training_date_change_requests
-----------------------------
id uuid primary key
training_id uuid not null
requested_by_user_id uuid not null
old_date date not null
requested_date date not null
reason text nullable
status enum('pending', 'approved', 'rejected')
reviewed_by_user_id uuid nullable
created_at timestamptz
reviewed_at timestamptz nullable
```

---

## 11. Participants

```sql
training_participants
---------------------
id uuid primary key
training_id uuid not null
employee_id uuid not null
joined_at timestamptz
completion_status enum(
  'joined',
  'in_progress',
  'passed',
  'failed',
  'completed_no_assessment'
)
```

Important:
- reference `employee_id`
- do not require participant to have role `trainee`
- Trainer may participate

Recommended unique constraint:

`unique(training_id, employee_id)`

---

## 12. Questions

```sql
training_questions
------------------
id uuid primary key
training_id uuid not null
question_text text not null
option_a text not null
option_b text not null
option_c text not null
option_d text not null
correct_option char(1) not null
order_index integer nullable
```

Multiple-choice only.

Same question pool used for Pre-Test and Post-Test.

---

## 13. Assessment Templates

If reusable templates are implemented:

```sql
assessment_templates
--------------------
id uuid primary key
name varchar not null
created_by_user_id uuid
is_active boolean default true
```

```sql
assessment_template_questions
-----------------------------
id uuid primary key
template_id uuid not null
question_text text not null
option_a text not null
option_b text not null
option_c text not null
option_d text not null
correct_option char(1) not null
```

When a template is selected, copy questions into `training_questions` so the training owns its final question set.

---

## 14. Assessment Sessions

```sql
assessment_sessions
-------------------
id uuid primary key
training_id uuid not null
type enum('pre', 'post', 'remedial')
status enum('closed', 'open')
opened_by_user_id uuid nullable
opened_at timestamptz nullable
closed_at timestamptz nullable
```

For remedial, session modeling may support multiple rounds if required.

---

## 15. Assessment Attempts

```sql
assessment_attempts
-------------------
id uuid primary key
training_id uuid not null
employee_id uuid not null
session_id uuid not null
type enum('pre', 'post', 'remedial')
attempt_number integer not null
started_at timestamptz
submitted_at timestamptz nullable
score numeric nullable
passed boolean nullable
```

Rules:
- Pre max 1
- Post max 1
- Remedial max 3

---

## 16. Answers

```sql
assessment_answers
------------------
id uuid primary key
attempt_id uuid not null
question_id uuid not null
selected_option char(1)
is_correct boolean
```

Shuffle order should not modify canonical question records.

---

## 17. Sync Logs

```sql
employee_sync_logs
------------------
id uuid primary key
triggered_by_user_id uuid not null
started_at timestamptz
completed_at timestamptz
incoming_count integer
added_count integer
updated_count integer
unchanged_count integer
deactivated_count integer
failed_count integer
status enum('success', 'warning', 'failed')
details jsonb nullable
```

Useful for audit and diagnostics.

---

## 18. Do Not Hard Delete

Avoid hard deletion for:
- employees
- users
- trainings
- participants
- attempts

Prefer status fields and soft deactivation to preserve history.
