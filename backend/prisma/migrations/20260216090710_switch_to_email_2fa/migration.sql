/*
  Warnings:

  - You are about to drop the column `owner_id` on the `MissingRequest` table. All the data in the column will be lost.
  - You are about to drop the column `product_name` on the `MissingRequest` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `remind_date` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Reminder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId,query]` on the table `MissingRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetPasswordToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `MissingRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query` to the `MissingRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MissingRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remindAt` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MissingRequest" DROP CONSTRAINT "MissingRequest_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_user_id_fkey";

-- AlterTable
ALTER TABLE "FacilityTask" ADD COLUMN     "batchId" TEXT;

-- AlterTable
ALTER TABLE "MissingRequest" DROP COLUMN "owner_id",
DROP COLUMN "product_name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "query" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "businessCategory" TEXT NOT NULL DEFAULT 'RETAIL';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "expiryNotified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "warningNotified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "guest_id" TEXT,
ADD COLUMN     "session_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reminder" DROP COLUMN "product",
DROP COLUMN "remind_date",
DROP COLUMN "user_id",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "remindAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loginLockedUntil" TIMESTAMP(3),
ADD COLUMN     "resetPasswordAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordLockedUntil" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "twoFactorCode" TEXT,
ADD COLUMN     "twoFactorCodeExpiry" TIMESTAMP(3),
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StaffRole" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffRole_ownerId_name_key" ON "StaffRole"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "MissingRequest_ownerId_query_key" ON "MissingRequest"("ownerId", "query");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffRole" ADD CONSTRAINT "StaffRole_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissingRequest" ADD CONSTRAINT "MissingRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
