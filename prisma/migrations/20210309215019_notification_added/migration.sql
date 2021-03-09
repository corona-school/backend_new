-- CreateEnum
CREATE TYPE "NotificationLevel" AS ENUM ('necessary', 'all');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('sent', 'error', 'pending');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationLevel" "NotificationLevel" NOT NULL DEFAULT E'all';

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL DEFAULT E'farrukh.faizy@corona-school.de',
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "textContent" TEXT,
    "htmlContent" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT E'pending',

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD FOREIGN KEY ("recipientEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
