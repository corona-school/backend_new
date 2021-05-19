/*
  Warnings:

  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_roleName_fkey";

-- DropTable
DROP TABLE "Roles";

-- DropTable
DROP TABLE "Tasks";

-- DropEnum
DROP TYPE "RolePriority";
