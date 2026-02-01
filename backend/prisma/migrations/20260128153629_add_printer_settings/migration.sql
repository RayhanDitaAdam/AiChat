-- AlterTable
ALTER TABLE "ChatHistory" ADD COLUMN     "status" TEXT DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "printerIp" TEXT,
ADD COLUMN     "printerPort" INTEGER;

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "aiSystemPrompt" TEXT NOT NULL DEFAULT 'You are Heart, an AI shopping assistant.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerConfig" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "showInventory" BOOLEAN NOT NULL DEFAULT true,
    "showChat" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OwnerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "id" TEXT NOT NULL,
    "shopping_list_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerConfig_owner_id_key" ON "OwnerConfig"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_user_id_key" ON "ShoppingList"("user_id");

-- AddForeignKey
ALTER TABLE "OwnerConfig" ADD CONSTRAINT "OwnerConfig_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "ShoppingList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
