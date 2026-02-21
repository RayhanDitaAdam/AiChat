-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CONTRIBUTOR';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "contributorId" TEXT;

-- CreateTable
CREATE TABLE "ContributorRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContributorRequest_userId_ownerId_key" ON "ContributorRequest"("userId", "ownerId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorRequest" ADD CONSTRAINT "ContributorRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorRequest" ADD CONSTRAINT "ContributorRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
