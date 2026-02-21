-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorRetryCount" INTEGER NOT NULL DEFAULT 0;
