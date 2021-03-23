/*
  Warnings:

  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('sent', 'error', 'pending');

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_recipientEmail_fkey";

-- DropTable
DROP TABLE "Notifications";
