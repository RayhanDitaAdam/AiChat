-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Lorong" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lorong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rak" (
    "id" TEXT NOT NULL,
    "lorongId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RakCategory" (
    "rakId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "RakCategory_pkey" PRIMARY KEY ("rakId","categoryId")
);

-- CreateTable
CREATE TABLE "ProductExpiry" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductExpiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpiryItem" (
    "id" TEXT NOT NULL,
    "productExpiryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpiryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySOP" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySOP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lorong_ownerId_name_key" ON "Lorong"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Rak_lorongId_name_key" ON "Rak"("lorongId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductExpiry_ownerId_date_key" ON "ProductExpiry"("ownerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ExpiryItem_productExpiryId_productId_key" ON "ExpiryItem"("productExpiryId", "productId");

-- AddForeignKey
ALTER TABLE "Lorong" ADD CONSTRAINT "Lorong_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rak" ADD CONSTRAINT "Rak_lorongId_fkey" FOREIGN KEY ("lorongId") REFERENCES "Lorong"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RakCategory" ADD CONSTRAINT "RakCategory_rakId_fkey" FOREIGN KEY ("rakId") REFERENCES "Rak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RakCategory" ADD CONSTRAINT "RakCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductExpiry" ADD CONSTRAINT "ProductExpiry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpiryItem" ADD CONSTRAINT "ExpiryItem_productExpiryId_fkey" FOREIGN KEY ("productExpiryId") REFERENCES "ProductExpiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpiryItem" ADD CONSTRAINT "ExpiryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySOP" ADD CONSTRAINT "CompanySOP_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
