-- Meeting / Ticket feature migration
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MEETING_INVITE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MEETING_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TICKET_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TICKET_UPDATED';

CREATE TABLE "Meeting" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "status" TEXT NOT NULL DEFAULT 'Scheduled',
  "location" TEXT,
  "meetingUrl" TEXT,
  "reminderMinutesBefore" INTEGER NOT NULL DEFAULT 15,
  "departmentId" TEXT NOT NULL,
  "hostId" TEXT NOT NULL,
  "accountId" TEXT,
  "leadId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MeetingParticipant" (
  "id" TEXT NOT NULL,
  "meetingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "response" TEXT NOT NULL DEFAULT 'Pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingParticipant_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Ticket" (
  "id" TEXT NOT NULL,
  "ticketNumber" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Open',
  "category" TEXT NOT NULL DEFAULT 'General',
  "departmentId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "assigneeId" TEXT,
  "accountId" TEXT,
  "leadId" TEXT,
  "dueDate" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TicketComment" (
  "id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TicketStatusHistory" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "changedById" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeetingParticipant_meetingId_userId_key" ON "MeetingParticipant"("meetingId","userId");
CREATE INDEX "Meeting_departmentId_startAt_idx" ON "Meeting"("departmentId","startAt");
CREATE INDEX "Meeting_hostId_startAt_idx" ON "Meeting"("hostId","startAt");
CREATE INDEX "Meeting_accountId_idx" ON "Meeting"("accountId");
CREATE INDEX "Meeting_leadId_idx" ON "Meeting"("leadId");
CREATE INDEX "MeetingParticipant_userId_idx" ON "MeetingParticipant"("userId");
CREATE INDEX "Ticket_departmentId_status_idx" ON "Ticket"("departmentId","status");
CREATE INDEX "Ticket_assigneeId_status_idx" ON "Ticket"("assigneeId","status");
CREATE INDEX "Ticket_accountId_idx" ON "Ticket"("accountId");
CREATE INDEX "Ticket_leadId_idx" ON "Ticket"("leadId");
CREATE INDEX "TicketComment_ticketId_createdAt_idx" ON "TicketComment"("ticketId","createdAt");
CREATE INDEX "TicketStatusHistory_ticketId_createdAt_idx" ON "TicketStatusHistory"("ticketId","createdAt");

ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetingParticipant" ADD CONSTRAINT "MeetingParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TicketStatusHistory" ADD CONSTRAINT "TicketStatusHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketStatusHistory" ADD CONSTRAINT "TicketStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
