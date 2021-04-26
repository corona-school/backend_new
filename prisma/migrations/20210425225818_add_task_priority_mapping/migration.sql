/*
  Warnings:

  - Added the required column `level` to the `Roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Roles" ADD COLUMN     "level" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minLevelRequired" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);
