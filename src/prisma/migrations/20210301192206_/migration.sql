/*
  Warnings:

  - You are about to drop the column `recipient` on the `TextNotifications` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[phone]` on the table `User`. If there are existing duplicate values, the migration will fail.
  - Added the required column `recipientPhone` to the `TextNotifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TextNotifications" DROP COLUMN "recipient",
ADD COLUMN     "recipientPhone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User.phone_unique" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "TextNotifications" ADD FOREIGN KEY ("recipientPhone") REFERENCES "User"("phone") ON DELETE CASCADE ON UPDATE CASCADE;
