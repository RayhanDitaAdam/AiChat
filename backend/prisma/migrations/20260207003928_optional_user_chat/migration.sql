-- DropForeignKey
ALTER TABLE "ChatHistory" DROP CONSTRAINT "ChatHistory_user_id_fkey";

-- AlterTable
ALTER TABLE "ChatHistory" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "avatarVariant" TEXT DEFAULT 'beam';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarVariant" TEXT DEFAULT 'beam';

-- CreateIndex
CREATE INDEX "ChatSession_guestId_idx" ON "ChatSession"("guestId");

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
