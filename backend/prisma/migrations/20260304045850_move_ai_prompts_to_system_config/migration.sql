/*
  Warnings:

  - You are about to drop the column `aiGuestSystemPrompt` on the `OwnerConfig` table. All the data in the column will be lost.
  - You are about to drop the column `aiSystemPrompt` on the `OwnerConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OwnerConfig" DROP COLUMN "aiGuestSystemPrompt",
DROP COLUMN "aiSystemPrompt";

-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN     "aiGuestSystemPrompt" TEXT NOT NULL DEFAULT 'You are HEART v.1, a smart and friendly store assistant. Help the guest with product information, including Aisle and Rack locations if available. Use natural and complete sentences in Indonesian. No small talk. No weather info.',
ADD COLUMN     "deepseekApiKey" TEXT;
