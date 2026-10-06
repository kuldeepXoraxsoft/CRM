CREATE INDEX "Meeting_departmentId_status_startAt_idx" ON "Meeting"("departmentId","status","startAt");
CREATE INDEX "Ticket_departmentId_createdAt_idx" ON "Ticket"("departmentId","createdAt");
