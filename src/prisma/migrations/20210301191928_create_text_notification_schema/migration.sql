/*
  Warnings:

  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_recipientEmail_fkey";

-- CreateTable
CREATE TABLE "EmailNotifications" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "textContent" TEXT,
    "htmlContent" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT E'pending',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextNotifications" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT E'pending',

    PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE "Notifications";

-- AddForeignKey
ALTER TABLE "EmailNotifications" ADD FOREIGN KEY ("recipientEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
