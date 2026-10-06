-- Remove ticket due dates: tickets are tracked by status/priority instead.
ALTER TABLE "Ticket" DROP COLUMN IF EXISTS "dueDate";
