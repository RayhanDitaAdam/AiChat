-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "vehicleType" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "complaints" TEXT NOT NULL,
    "mechanic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "notes" TEXT,
    "totalCost" DOUBLE PRECISION,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderItem" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PART',
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WorkOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrder_ownerId_idx" ON "WorkOrder"("ownerId");

-- CreateIndex
CREATE INDEX "WorkOrder_vehiclePlate_idx" ON "WorkOrder"("vehiclePlate");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderItem" ADD CONSTRAINT "WorkOrderItem_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
