/*
  Warnings:

  - Added the required column `notificationLevel` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationLevel" AS ENUM ('necessary', 'all');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationLevel" "NotificationLevel" NOT NULL;
