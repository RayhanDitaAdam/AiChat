/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `POSSetting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `POSReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `POSSetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "POSReward" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "POSSetting" ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "POSSetting_ownerId_key" ON "POSSetting"("ownerId");

-- AddForeignKey
ALTER TABLE "POSReward" ADD CONSTRAINT "POSReward_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "POSSetting" ADD CONSTRAINT "POSSetting_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
