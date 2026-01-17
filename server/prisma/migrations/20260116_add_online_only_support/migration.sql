-- AlterTable: Make location fields nullable for online-only businesses
ALTER TABLE "Pulperia" ALTER COLUMN "latitude" DROP NOT NULL;
ALTER TABLE "Pulperia" ALTER COLUMN "longitude" DROP NOT NULL;
ALTER TABLE "Pulperia" ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable: Add online business fields
ALTER TABLE "Pulperia" ADD COLUMN "originCity" TEXT;
ALTER TABLE "Pulperia" ADD COLUMN "shippingScope" TEXT NOT NULL DEFAULT 'LOCAL';

-- CreateTable
CREATE TABLE "ShippingMethod" (
    "id" TEXT NOT NULL,
    "pulperiaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coverageArea" TEXT,
    "estimatedDays" TEXT,
    "baseCost" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingMethod_pulperiaId_idx" ON "ShippingMethod"("pulperiaId");

-- AddForeignKey
ALTER TABLE "ShippingMethod" ADD CONSTRAINT "ShippingMethod_pulperiaId_fkey" FOREIGN KEY ("pulperiaId") REFERENCES "Pulperia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
