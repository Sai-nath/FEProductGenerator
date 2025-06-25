-- CreateTable
CREATE TABLE "LineOfBusiness" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LineOfBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreenConfiguration" (
    "id" UUID NOT NULL,
    "screenKey" TEXT NOT NULL,
    "screenName" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScreenConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceProduct" (
    "id" UUID NOT NULL,
    "productKey" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lobId" UUID,
    "screenConfigId" UUID NOT NULL,

    CONSTRAINT "InsuranceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LineOfBusiness_name_key" ON "LineOfBusiness"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScreenConfiguration_screenKey_key" ON "ScreenConfiguration"("screenKey");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceProduct_productKey_key" ON "InsuranceProduct"("productKey");

-- AddForeignKey
ALTER TABLE "InsuranceProduct" ADD CONSTRAINT "InsuranceProduct_lobId_fkey" FOREIGN KEY ("lobId") REFERENCES "LineOfBusiness"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceProduct" ADD CONSTRAINT "InsuranceProduct_screenConfigId_fkey" FOREIGN KEY ("screenConfigId") REFERENCES "ScreenConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
