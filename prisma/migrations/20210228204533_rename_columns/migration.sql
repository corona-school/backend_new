/*
  Warnings:

  - You are about to drop the column `TextContent` on the `Notifications` table. All the data in the column will be lost.
  - You are about to drop the column `HTMLContent` on the `Notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "TextContent",
DROP COLUMN "HTMLContent",
ADD COLUMN     "textContent" TEXT,
ADD COLUMN     "htmlContent" TEXT;
