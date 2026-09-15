-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "departmentId" TEXT;

-- CreateIndex
CREATE INDEX "Activity_departmentId_idx" ON "Activity"("departmentId");

-- CreateIndex
CREATE INDEX "Activity_actorId_idx" ON "Activity"("actorId");

-- CreateIndex
CREATE INDEX "Activity_departmentId_createdAt_idx" ON "Activity"("departmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
