/*
  Warnings:

  - Added the required column `roleName` to the `UserRoles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRoles" ADD COLUMN     "roleName" TEXT NOT NULL;
