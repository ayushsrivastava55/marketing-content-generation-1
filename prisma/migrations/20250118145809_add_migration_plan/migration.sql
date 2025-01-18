-- CreateTable
CREATE TABLE "MigrationPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "currentTechnologies" TEXT NOT NULL,
    "targetTechnologies" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "riskAssessment" TEXT NOT NULL,
    "costEstimate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" REAL NOT NULL DEFAULT 0,
    "startDate" TEXT NOT NULL,
    "expectedEndDate" TEXT,
    "actualEndDate" TEXT,
    "teamSize" INTEGER NOT NULL DEFAULT 0,
    "budget" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MigrationPlan_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "CompanyProfile" ("userEmail") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MigrationPlan_userEmail_key" ON "MigrationPlan"("userEmail");
