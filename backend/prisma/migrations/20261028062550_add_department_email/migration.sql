-- CreateTable
CREATE TABLE "DepartmentEmailConfig" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL DEFAULT 587,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "smtpUser" TEXT NOT NULL,
    "smtpPasswordEnc" TEXT NOT NULL,
    "fromName" TEXT,
    "fromEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentEmailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentEmailConfig_departmentId_key" ON "DepartmentEmailConfig"("departmentId");

-- AddForeignKey
ALTER TABLE "DepartmentEmailConfig" ADD CONSTRAINT "DepartmentEmailConfig_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
