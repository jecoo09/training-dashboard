# RBAC — Role-Based Access Control

## 1. General Model

One user has exactly one role.

Roles:

- superadmin
- admin
- trainer
- trainee

RBAC controls:
- route access
- actions
- navigation
- data visibility

Training participation is not a role.

---

## 2. Superadmin

### Allowed
- access Superadmin dashboard
- access Admin monitoring features
- view all trainings
- view all participants
- view all assessment results
- approve training
- reject training
- request revision
- create Admin account
- create Trainer account
- manage work-area master
- manage training-name master
- manage training-program master
- map training name -> training program
- configure default training hours
- trigger employee master sync
- inspect sync result

### Not Allowed
- submit training request
- silently edit Trainer submission
- reset user password through admin tools

---

## 3. Admin

### Allowed
- access Admin dashboard
- view all trainings
- view all participants
- view all assessment results
- approve training
- reject training
- request revision
- create Trainer account
- filter monitoring by Trainer and other supported dimensions

### Not Allowed
- submit training request
- create Admin account
- manage Superadmin-only master configuration
- directly edit submitted training
- reset another user's password

---

## 4. Trainer

### Allowed
- access Trainer dashboard
- access My Trainings
- submit training request
- edit own request while editable
- cancel own request
- respond to revision request
- request execution-date change after approval
- view own training details
- view participants in own training
- view assessment scores for own training
- start/close Pre-Test
- start/close Post-Test
- start/close remedial
- end own approved training
- access Join Training
- participate in another training

### Not Allowed
- approve training
- view unrestricted Admin features
- create Trainer/Admin accounts
- modify another Trainer's training unless explicitly assigned and permission is added later

---

## 5. Trainee

### Allowed
- login
- access Trainee home
- enter training token
- join eligible training
- complete available assessments
- view profile
- view personal training history

### Not Allowed
- submit training
- approve/reject training
- view other participant results
- control test sessions
- manage users
- manage configuration

---

## 6. Suggested Route Model

Suggested target routes:

### Shared
- `/login`
- `/profile`

### Superadmin
- `/superadmin`
- `/superadmin/admins`
- `/superadmin/trainers`
- `/superadmin/employees`
- `/superadmin/settings`
- `/superadmin/trainings`

### Admin
- `/admin`
- `/admin/trainers`
- `/admin/trainings`
- `/admin/trainings/[id]`

### Trainer
- `/trainer`
- `/trainer/trainings`
- `/trainer/trainings/new`
- `/trainer/trainings/[id]`
- `/trainer/join-training`
- `/trainer/history`

### Trainee
- `/trainee`
- `/trainee/join-training`
- `/trainee/trainings/[id]`
- `/trainee/history`
- `/trainee/profile`

Exact paths may be adapted to preserve existing routes.

---

## 7. Route Redirect After Login

Target behavior:

- `superadmin` -> `/superadmin`
- `admin` -> `/admin`
- `trainer` -> `/trainer`
- `trainee` -> `/trainee`

Authorization must still be checked server-side.

Client-side redirect is not sufficient protection.
