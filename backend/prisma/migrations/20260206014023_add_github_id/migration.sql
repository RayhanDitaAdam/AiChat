/*
  Warnings:

  - A unique constraint covering the columns `[ownerCode]` on the table `Owner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[githubId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- AlterTable
ALTER TABLE "ChatHistory" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "address" TEXT,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "ownerCode" TEXT,
ADD COLUMN     "postalCode" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "bedType" TEXT,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "isFastMoving" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSecondHand" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productType" TEXT NOT NULL DEFAULT 'jual',
ADD COLUMN     "room" TEXT,
ADD COLUMN     "section" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "view360Url" TEXT;

-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN     "dailyChatLimitOwner" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "dailyChatLimitUser" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "disabledMenus" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "medicalRecord" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "registrationType" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "FacilityTask" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "location" TEXT NOT NULL,
    "taskDetail" TEXT NOT NULL,
    "report" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "taskDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subLocationId" TEXT,

    CONSTRAINT "FacilityTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPromo" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "promoPrice" DOUBLE PRECISION,
    "discountPercent" DOUBLE PRECISION,
    "freeItemName" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPromo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobVacancy" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "salary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobVacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubLocation" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "view360Url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EARN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPending" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPending_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPending_email_key" ON "UserPending"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_ownerCode_key" ON "Owner"("ownerCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE INDEX "User_githubId_idx" ON "User"("githubId");

-- AddForeignKey
ALTER TABLE "FacilityTask" ADD CONSTRAINT "FacilityTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityTask" ADD CONSTRAINT "FacilityTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityTask" ADD CONSTRAINT "FacilityTask_subLocationId_fkey" FOREIGN KEY ("subLocationId") REFERENCES "SubLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPromo" ADD CONSTRAINT "ProductPromo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobVacancy" ADD CONSTRAINT "JobVacancy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubLocation" ADD CONSTRAINT "SubLocation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardActivity" ADD CONSTRAINT "RewardActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
