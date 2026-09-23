# Authentication and Employee Synchronization

## 1. Employee Master Source

Google Sheets contains employee master data:

- NIK
- Name
- Date of Birth
- Location
- Position

Source date format may be:

`MM/DD/YYYY`

During synchronization, normalize to PostgreSQL `DATE`:

`YYYY-MM-DD`

---

## 2. Synchronization Model

Synchronization is manual.

Only Superadmin may trigger it.

UI example:

`Sync Employee Data`

Flow:

1. Superadmin clicks Sync.
2. Server fetches employee master data from Google Sheets.
3. Data is validated and normalized.
4. Incoming dataset is compared with Neon `employees`.
5. New employees are inserted.
6. Changed employees are updated.
7. Missing employees are marked inactive.
8. Existing employee history remains intact.
9. Sync result is shown.
10. Sync log is stored.

Do not hard-delete employees missing from Sheets.

---

## 3. Sync Safety

Before committing suspicious changes, warn the Superadmin.

Example conditions:
- incoming dataset unexpectedly small
- very high deactivation count
- malformed required columns
- duplicate NIK
- invalid birth dates

Example warning:

- Existing employees: 2,081
- Incoming rows: 53
- Employees to deactivate: 2,028

Require explicit confirmation for suspicious destructive sync results.

---

## 4. Trainee Provisioning

All active employees are eligible to access the Trainee experience.

Do not necessarily create a `users` row for every employee during sync.

Preferred model:
- employee exists after sync
- user account is created lazily on first successful login

This keeps employee master and application access separate.

---

## 5. Initial Trainee Credential

Initial password convention:

Birth date formatted as:

`YYYYMMDD`

Example:

DOB:
`05/21/1997`

Initial password:
`19970521`

This is an initial/internal credential mechanism.

Never store this value as plaintext.

---

## 6. First Login

Preferred flow:

1. User enters NIK.
2. User enters DOB-derived password.
3. Server looks up employee.
4. Server validates employee active status.
5. Server verifies entered value against employee birth date for first activation.
6. If no user account exists, create user:
   - role = trainee
   - password_hash = secure hash
7. Create session.
8. Redirect to Trainee dashboard.

After account creation, subsequent authentication should use the stored password hash.

---

## 7. Password Storage

Use a secure password hash.

Recommended:
- Argon2id
- or bcrypt if already supported consistently

Never:
- store plaintext DOB password
- expose password hashes
- log submitted passwords

---

## 8. Rate Limiting

Because DOB-derived credentials are predictable, login must have additional protection.

At minimum:
- rate limit failed attempts
- temporary lock/backoff
- secure cookies
- HTTPS
- server-side auth validation

Future security improvement:
- email OTP
- forced password change
- password recovery via verified email

---

## 9. Trainer Account Creation

Admin/Superadmin creates Trainer accounts.

Preferred flow:

1. Search employee by NIK/name.
2. Select employee.
3. If user does not exist:
   - create user with role `trainer`
4. If trainee user already exists:
   - convert role from `trainee` to `trainer`
5. Preserve employee identity and training history.

Do not create a duplicate employee.

---

## 10. Admin Account Creation

Only Superadmin may create Admin accounts.

Admin should be linked to an employee record where appropriate.

If business rules require non-employee Admin later, schema may allow `employee_id` nullable.

---

## 11. Superadmin

Superadmin account is seeded outside normal UI.

No UI is required to create additional Superadmin accounts unless explicitly introduced later.

---

## 12. Role Change and Training History

Changing:

`trainee -> trainer`

must not delete:
- past participation
- scores
- training history

History belongs to the employee identity, not the user's current role.

---

## 13. Future Password Recovery

Target future flow:

- verified email
- OTP
- password reset

Do not implement insecure Admin-visible password reset.
