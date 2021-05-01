/*
  Warnings:

  - Added the required column `recipientName` to the `EmailNotifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailNotifications" ADD COLUMN     "recipientName" TEXT NOT NULL;
