# Cyvora CRM - Meetings, Tickets, Pagination & Searchable Users

## Included

- Server-side pagination + search for My To-dos and Assigned Tasks.
- Server-side pagination + search for Meetings and Tickets.
- Reusable debounced `DataTable` server-search mode.
- Lightweight `GET /api/users/options` endpoint for assignment/selection.
- Reusable `UserSearchSelect` with debounced server search.
- Tasks use `purpose=assignment` so managers only see themselves/direct reports and admins see their department.
- Meetings use `purpose=meeting` so users can invite active users in their department.
- Meetings use explicit `MeetingParticipant` rows for future Accepted/Declined/Maybe/attendance support.
- Tickets include assignee, comments, and status history.
- Meeting reminders and ticket notifications are wired to the existing notification service.

## API response shape

Paginated list endpoints return:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## User option API

```http
GET /api/users/options?purpose=assignment&search=kul&limit=20
GET /api/users/options?purpose=meeting&search=rah&limit=20&ids=id1,id2
```

The `ids` parameter keeps already-selected users available even when the current search text changes.

## Run

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma migrate dev
pnpm dev
```

Frontend:

```bash
pnpm install
pnpm dev
```

The uploaded project did not contain installed `node_modules`, so Vite/Prisma binary validation could not be executed in this environment. Backend JS syntax checks were run successfully.
