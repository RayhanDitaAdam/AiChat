-- AlterTable
ALTER TABLE "StaffRole" ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "staffRoleId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_staffRoleId_fkey" FOREIGN KEY ("staffRoleId") REFERENCES "StaffRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
