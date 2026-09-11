# Cyvora CRM - Backend

Node.js + Express + Prisma + PostgreSQL API for the Cyvora CRM
(Leads, Accounts, Employees, Teams, Tasks, Activity feed).

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your real values:
   ```
   cp .env.example .env
   ```
   - `DATABASE_URL` - your PostgreSQL connection string
   - `JWT_SECRET` - any long random string

3. Create the database tables:
   ```
   npx prisma migrate dev --name init
   ```

4. Seed an admin, a manager, and an employee to log in with:
   ```
   npm run seed
   ```
   This creates:
   - `admin@cyvora.com`
   - `arun@cyvora.com` (manager)
   - `diyorbek@cyvora.com` (employee)
   - Password for all three: `password123`

5. Start the dev server:
   ```
   npm run dev
   ```
   API runs at `http://localhost:5000` (health check: `GET /health`).

## Auth

Login with `POST /api/auth/login` (`{ email, password }`) returns a JWT.
Send it on every other request as:
```
Authorization: Bearer <token>
```

## Endpoints

| Method | Path                          | Notes                                   |
|--------|-------------------------------|------------------------------------------|
| POST   | /api/auth/login               | Public                                   |
| GET    | /api/auth/me                  | Current user                             |
| GET    | /api/employees                | Role-scoped list                         |
| POST   | /api/employees                | manager/admin                            |
| PATCH  | /api/employees/:id             | manager/admin                            |
| DELETE | /api/employees/:id             | admin only                               |
| GET    | /api/teams                    | Role-scoped list                         |
| POST   | /api/teams                    | manager/admin                            |
| PATCH  | /api/teams/:id                 | manager/admin                            |
| DELETE | /api/teams/:id                 | admin only                               |
| GET    | /api/leads                    | Role-scoped list                         |
| POST   | /api/leads                    | Create                                   |
| POST   | /api/leads/bulk                | Bulk import ({ leads: [...] })           |
| PATCH  | /api/leads/:id                 | Update (never touches followUpDate)      |
| DELETE | /api/leads/:id                 | Delete                                   |
| POST   | /api/leads/:id/follow-up       | { newDate, remark } - remark required    |
| POST   | /api/leads/:id/convert         | Converts to an Account                   |
| GET    | /api/accounts                 | Same shape as Leads                      |
| ...    | /api/accounts/...              | Same pattern as Leads (minus convert)    |
| GET    | /api/todos                    | Current user's todos                     |
| POST   | /api/todos                    | Create                                   |
| PATCH  | /api/todos/:id                 | Update                                   |
| PATCH  | /api/todos/:id/toggle          | Toggle complete                          |
| DELETE | /api/todos/:id                 | Delete                                   |
| GET    | /api/tasks                    | Role-scoped assigned tasks               |
| POST   | /api/tasks                    | manager/admin - assign a task            |
| PATCH  | /api/tasks/:id/status          | Assignee updates their own task's status |
| PATCH  | /api/tasks/:id/reassign        | manager/admin                            |
| POST   | /api/tasks/:id/comments        | Add a follow-up comment                  |
| DELETE | /api/tasks/:id                 | manager/admin                            |
| GET    | /api/activity                 | Last 50 activity log entries             |

## Notes

- Permission matrix lives in `src/constants/permissions.js` - mirrors the
  frontend's `constants/roles.js` exactly.
- Follow-up date changes for Leads/Accounts ONLY go through the
  `/follow-up` endpoints, which require a `remark` and append to history -
  the generic PATCH endpoints intentionally ignore any `followUpDate` in
  the body after creation.
- `logActivity()` (src/utils/activityLogger.js) is called from
  Employees/Teams/Leads(convert)/Tasks(assign+reassign) controllers -
  add more calls anywhere else you want it to show up on the frontend's
  "Recent Activity" widget.
