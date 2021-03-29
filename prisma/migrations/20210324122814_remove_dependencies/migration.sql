/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[userId]` on the table `AuthenticationData`. If there are existing duplicate values, the migration will fail.
  - The migration will add a unique constraint covering the columns `[token]` on the table `RefreshToken`. If there are existing duplicate values, the migration will fail.

*/
-- DropForeignKey
ALTER TABLE "AuthenticationData" DROP CONSTRAINT "AuthenticationData_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "AuthenticationData.userId_unique" ON "AuthenticationData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken.token_unique" ON "RefreshToken"("token");
