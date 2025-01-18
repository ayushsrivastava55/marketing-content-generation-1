/*
  Warnings:

  - You are about to drop the column `email` on the `CompanyProfile` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "name" TEXT,
    "size" TEXT,
    "industry" TEXT,
    "technologyStack" TEXT,
    "targetMarket" TEXT,
    "geographicPresence" TEXT,
    "serviceOfferings" TEXT,
    "businessChallenges" TEXT,
    "innovationPriorities" TEXT,
    "budgetRange" TEXT,
    "implementationTimeline" TEXT,
    "complianceRequirements" TEXT,
    "teamExpertise" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CompanyProfile" ("createdAt", "id", "industry", "name", "updatedAt") SELECT "createdAt", "id", "industry", "name", "updatedAt" FROM "CompanyProfile";
DROP TABLE "CompanyProfile";
ALTER TABLE "new_CompanyProfile" RENAME TO "CompanyProfile";
CREATE UNIQUE INDEX "CompanyProfile_userEmail_key" ON "CompanyProfile"("userEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
