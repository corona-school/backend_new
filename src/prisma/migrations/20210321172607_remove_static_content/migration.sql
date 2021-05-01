/*
  Warnings:

  - You are about to drop the column `textContent` on the `EmailNotifications` table. All the data in the column will be lost.
  - You are about to drop the column `htmlContent` on the `EmailNotifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmailNotifications" DROP COLUMN "textContent",
DROP COLUMN "htmlContent";
