/*
  Warnings:

  - Made the column `variables` on table `EmailNotifications` required. The migration will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EmailNotifications" ALTER COLUMN "variables" SET NOT NULL;
