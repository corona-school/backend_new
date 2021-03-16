/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumberVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.
  - The migration will add a unique constraint covering the columns `[phone]` on the table `User`. If there are existing duplicate values, the migration will fail.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_recipientEmail_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneNumber",
DROP COLUMN "phoneNumberVerified",
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Notifications";

-- CreateTable
CREATE TABLE "EmailNotifications" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "textContent" TEXT,
    "htmlContent" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT E'pending',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextNotifications" (
    "id" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT E'pending',

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.phone_unique" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "EmailNotifications" ADD FOREIGN KEY ("recipientEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextNotifications" ADD FOREIGN KEY ("recipientPhone") REFERENCES "User"("phone") ON DELETE CASCADE ON UPDATE CASCADE;
