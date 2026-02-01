/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "memberOfId" TEXT,
ADD COLUMN     "qrCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_customerId_key" ON "User"("customerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberOfId_fkey" FOREIGN KEY ("memberOfId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
