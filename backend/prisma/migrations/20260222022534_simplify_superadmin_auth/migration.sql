/*
  Warnings:

  - You are about to drop the column `currentChallenge` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sshChallenge` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sshChallengeExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sshPublicKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Authenticator` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentChallenge",
DROP COLUMN "sshChallenge",
DROP COLUMN "sshChallengeExpiry",
DROP COLUMN "sshPublicKey";

-- DropTable
DROP TABLE "Authenticator";

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "superAdminId" TEXT NOT NULL,
    "targetAdminId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_superAdminId_idx" ON "AuditLog"("superAdminId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_targetAdminId_fkey" FOREIGN KEY ("targetAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
