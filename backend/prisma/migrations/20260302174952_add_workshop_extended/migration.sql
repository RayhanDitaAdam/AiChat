-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "mechanicId" TEXT;

-- CreateTable
CREATE TABLE "Mechanic" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "specialization" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MechanicAttendance" (
    "id" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "totalHours" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MechanicAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mechanic_ownerId_idx" ON "Mechanic"("ownerId");

-- CreateIndex
CREATE INDEX "MechanicAttendance_mechanicId_idx" ON "MechanicAttendance"("mechanicId");

-- CreateIndex
CREATE INDEX "MechanicAttendance_ownerId_idx" ON "MechanicAttendance"("ownerId");

-- CreateIndex
CREATE INDEX "MechanicAttendance_date_idx" ON "MechanicAttendance"("date");

-- CreateIndex
CREATE INDEX "Supplier_ownerId_idx" ON "Supplier"("ownerId");

-- CreateIndex
CREATE INDEX "WorkOrder_mechanicId_idx" ON "WorkOrder"("mechanicId");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mechanic" ADD CONSTRAINT "Mechanic_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MechanicAttendance" ADD CONSTRAINT "MechanicAttendance_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Mechanic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MechanicAttendance" ADD CONSTRAINT "MechanicAttendance_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
