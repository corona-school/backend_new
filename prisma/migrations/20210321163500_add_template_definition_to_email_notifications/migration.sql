/*
  Warnings:

  - Added the required column `template` to the `EmailNotifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailNotifications" ADD COLUMN     "template" TEXT NOT NULL;
