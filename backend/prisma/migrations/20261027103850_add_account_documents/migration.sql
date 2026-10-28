-- CreateTable
CREATE TABLE "AccountDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "AccountDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountDocument_storageName_key" ON "AccountDocument"("storageName");

-- CreateIndex
CREATE INDEX "AccountDocument_accountId_uploadedAt_idx" ON "AccountDocument"("accountId", "uploadedAt");

-- AddForeignKey
ALTER TABLE "AccountDocument" ADD CONSTRAINT "AccountDocument_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
