-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "POSSetting" ADD COLUMN     "pointBonusBirthday" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "pointBonusRegistration" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "pointExpiryDays" INTEGER NOT NULL DEFAULT 365,
ADD COLUMN     "pointFridayMultiplier" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "pointMaxUsagePercent" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "pointMinRedeem" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "PointHistory" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentChallenge" TEXT,
ADD COLUMN     "sshChallenge" TEXT,
ADD COLUMN     "sshChallengeExpiry" TIMESTAMP(3),
ADD COLUMN     "sshPublicKey" TEXT;

-- CreateTable
CREATE TABLE "AICache" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "query" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'id',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AICache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "id" TEXT NOT NULL,
    "credentialID" BYTEA NOT NULL,
    "credentialPublicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AICache_queryHash_idx" ON "AICache"("queryHash");

-- CreateIndex
CREATE UNIQUE INDEX "AICache_ownerId_queryHash_language_key" ON "AICache"("ownerId", "queryHash", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
