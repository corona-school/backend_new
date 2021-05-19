/*
  Warnings:

  - You are about to drop the column `roleId` on the `UserRoles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,roleName]` on the table `UserRoles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_roleId_fkey";

-- DropIndex
DROP INDEX "UserRoles.userId_roleId_unique";

-- AlterTable
ALTER TABLE "UserRoles" DROP COLUMN "roleId";

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles.userId_roleName_unique" ON "UserRoles"("userId", "roleName");

-- AddForeignKey
ALTER TABLE "UserRoles" ADD FOREIGN KEY ("roleName") REFERENCES "Roles"("name") ON DELETE CASCADE ON UPDATE CASCADE;
