# Cyvora CRM - Meetings + Tickets feature patch

## What this patch adds

### Meetings
- Persistent Prisma `Meeting` model.
- Explicit `MeetingParticipant` join table with `Pending/Accepted/Declined` response.
- Department/manager/employee visibility using the same hierarchy as Tasks.
- Create/edit/cancel/delete.
- Participant invitations.
- Meeting URL + location.
- Reminder notifications.
- Optional `accountId` / `leadId` relations in the backend.

### Tickets / Issues
- Persistent `Ticket` model with auto-increment ticket number.
- Department + creator + assignee scoping.
- Priority, status, category, due date.
- Optional `accountId` / `leadId` relations.
- Ticket comments.
- Ticket status history.
- Assignment/update notifications.

## Install / migrate

From `backend`:

```bash
pnpm prisma:generate
pnpm prisma migrate dev
```

If you are applying the supplied migration manually to an existing production DB, use the SQL in:
`prisma/migrations/20261005120000_add_meetings_tickets/migration.sql`

Then start backend normally.

## Frontend

The patch registers:
- `/meetings`
- `/tickets`

It also fixes the existing navigation typo where Meetings had `to: "meetings"` instead of `/meetings`.

## Important existing-project note

The original repository already contained a mock Meetings UI and an empty `meetingController.js`. This patch replaces that mock state with API-backed persistence.

The existing `src/data/meetingData.js` can remain in the repo, but the new Meetings page no longer depends on it.

## Recommended next additions

1. Add Account/Lead searchable selectors to the meeting/ticket modals instead of only using backend `accountId`/`leadId`.
2. Add calendar month/week view for Meetings.
3. Add ticket filters: status, priority, assignee, category, overdue.
4. Add ticket SLA fields if Support becomes a major workflow.
5. Add websocket/SSE later only for live updates; existing notification persistence remains the source of truth.

## Ticket permission update
- Every authenticated user can raise a ticket.
- Only manager, admin, and superAdmin can assign a ticket.
- Ticket assignment uses a separate Assign Ticket modal and endpoint.
- Ticket due dates have been removed from the UI, API, and Prisma model.
- Raise/Edit Ticket only exposes title, description, priority, and status.
