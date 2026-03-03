-- AlterTable
ALTER TABLE "OwnerConfig" ADD COLUMN     "workshopAccentColor" TEXT,
ADD COLUMN     "workshopInvoiceFooter" TEXT,
ADD COLUMN     "workshopPhone" TEXT,
ADD COLUMN     "workshopTaxId" TEXT;

-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN     "companyLogo" TEXT,
ADD COLUMN     "companyName" TEXT NOT NULL DEFAULT 'HeartAI';
