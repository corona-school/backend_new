/*
  Warnings:

  - You are about to drop the column `refreshTokenId` on the `AuthenticationData` table. All the data in the column will be lost.
  - Added the required column `authId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuthenticationData" DROP CONSTRAINT "AuthenticationData_refreshTokenId_fkey";

-- AlterTable
ALTER TABLE "AuthenticationData" DROP COLUMN "refreshTokenId";

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "authId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD FOREIGN KEY ("authId") REFERENCES "AuthenticationData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
