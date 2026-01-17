-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "pulperiaId" TEXT NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "description" VARCHAR(200),
    "price" DOUBLE PRECISION,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "imageAspectRatio" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_pulperiaId_idx" ON "Announcement"("pulperiaId");

-- CreateIndex
CREATE INDEX "Announcement_isActive_expiresAt_idx" ON "Announcement"("isActive", "expiresAt");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_pulperiaId_fkey" FOREIGN KEY ("pulperiaId") REFERENCES "Pulperia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
