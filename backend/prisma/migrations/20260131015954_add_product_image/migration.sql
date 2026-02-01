/*
  Warnings:

  - You are about to drop the column `section` on the `Product` table. All the data in the column will be lost.
  - Added the required column `rak` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatHistory" ADD COLUMN     "session_id" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "section",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "rak" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN     "chatRetentionDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "geminiApiKey" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT DEFAULT 'New Conversation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatSession_userId_ownerId_idx" ON "ChatSession"("userId", "ownerId");

-- CreateIndex
CREATE INDEX "ChatHistory_session_id_idx" ON "ChatHistory"("session_id");

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
