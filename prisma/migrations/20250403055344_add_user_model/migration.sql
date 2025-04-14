/*
  Warnings:

  - You are about to drop the column `email` on the `CompanyProfile` table. All the data in the column will be lost.
  - Added the required column `budgetRange` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessChallenges` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `implementationTimeline` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `innovationPriorities` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamExpertise` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `technologyStack` to the `CompanyProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `industry` on table `CompanyProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `CompanyProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "technologyStack" TEXT NOT NULL,
    "teamExpertise" TEXT NOT NULL,
    "businessChallenges" TEXT NOT NULL,
    "innovationPriorities" TEXT NOT NULL,
    "implementationTimeline" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CompanyProfile" ("createdAt", "id", "industry", "name", "updatedAt") SELECT "createdAt", "id", "industry", "name", "updatedAt" FROM "CompanyProfile";
DROP TABLE "CompanyProfile";
ALTER TABLE "new_CompanyProfile" RENAME TO "CompanyProfile";
CREATE UNIQUE INDEX "CompanyProfile_userId_key" ON "CompanyProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
