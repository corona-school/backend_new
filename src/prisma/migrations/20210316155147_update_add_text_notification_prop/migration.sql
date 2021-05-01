/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumberVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.
  - The migration will add a unique constraint covering the columns `[phone]` on the table `User`. If there are existing duplicate values, the migration will fail.

*/

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phoneNumber",
DROP COLUMN "phoneNumberVerified",
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
