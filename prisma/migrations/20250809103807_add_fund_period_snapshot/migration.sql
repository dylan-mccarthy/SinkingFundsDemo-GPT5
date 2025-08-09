-- CreateTable
CREATE TABLE "FundPeriodSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "openingCents" INTEGER NOT NULL DEFAULT 0,
    "closingCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FundPeriodSnapshot_userId_periodId_fundId_key" ON "FundPeriodSnapshot"("userId", "periodId", "fundId");
