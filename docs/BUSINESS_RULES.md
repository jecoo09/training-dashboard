# Business Rules

## 1. Roles

Each application user has exactly one role.

Valid roles:

- `superadmin`
- `admin`
- `trainer`
- `trainee`

Role does not determine whether an employee may be a training participant.

---

## 2. Training Submission

Only Trainer users may submit training requests.

Required fields:

- training name/title
- execution date
- work area
- internal/external
- trainer list
- has assessment: yes/no

Admin and Superadmin cannot submit training requests.

---

## 3. Trainer Assignment

The submitting Trainer is automatically assigned as Trainer 1.

During preparation, Trainer 1 may be changed.

Additional Trainers:
- selected from Trainer accounts
- may include manually entered name through `Other`

A training may have multiple Trainers.

---

## 4. Approval

Admin and Superadmin may:

- approve
- reject
- request revision

They may not directly edit the request.

After approval:
- Trainer may not edit the training freely
- Trainer may submit a date-change request

---

## 5. Cancelation

Trainer may cancel a training request before the training is completed.

Canceled training must remain in the database for audit/history.

Do not hard-delete canceled training.

---

## 6. Training Token

Approved training receives a token.

The token:
- is visible in Trainer Training Detail
- is shared with participants
- is entered by participant after login
- links the participant to the intended training

Token validation must happen server-side.

---

## 7. Assessment Availability

If `has_assessment = false`:
- no Pre-Test flow
- no Post-Test flow
- no remedial flow

If `has_assessment = true`:
- training must have assessment questions
- Trainer controls test availability

---

## 8. Question Source

Assessment questions are per training.

Trainer has two options:

### Use Existing Template
Use an available assessment template.

### Upload Questions
Upload CSV/XLSX following the required application format.

Question type:
- multiple choice only

Pre-Test and Post-Test:
- use the same question pool
- question order is shuffled
- answer-option order is shuffled

---

## 9. Test Control

Trainer controls:

- Start Pre-Test
- Close Pre-Test
- Start Post-Test
- Close Post-Test
- Start Remedial
- Close Remedial
- End Training

Participant may only access a test while the relevant session is open.

---

## 10. Time Limit

Time limit is derived from question count.

Rule:

`1 question = 1 minute`

Example:
- 20 questions = 20 minutes

Applies to:
- Pre-Test
- Post-Test

Remedial should follow the same rule unless explicitly changed later.

---

## 11. Attempts

- Pre-Test: maximum 1 attempt
- Post-Test: maximum 1 attempt
- Remedial: maximum 3 attempts

Attempts must be enforced server-side.

---

## 12. Passing Grade

Passing grade:

`90`

If Post-Test score is below 90:
- participant requires remedial

If a remedial attempt reaches at least 90:
- participant passes

If all allowed remedial attempts remain below 90:
- participant remains not passed

---

## 13. Score Visibility

After participant submits an assessment:

- score is stored
- participant does not immediately see the score
- Trainer can view the score
- Admin/Superadmin can view the score

Participant-facing score visibility may be introduced later if explicitly approved.

---

## 14. Training Completion

Trainer manually ends the training.

When ended:
- training becomes Completed
- final participant status is preserved
- assessment sessions close
- further participation changes should be restricted

---

## 15. Trainee History

Trainee can view:

- training name
- training date
- Pre-Test result
- Post-Test result
- remedial result if any
- passing status

Detailed history appears in profile/history views.

---

## 16. Trainer Joining Training

Trainer may join another training as a participant.

Trainer uses:

`Join Training`

The flow should reuse Trainee participant components where possible.

Trainer role remains `trainer`.

Training participation is stored independently from account role.
