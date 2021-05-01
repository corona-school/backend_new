-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('high', 'low');

-- AlterTable
ALTER TABLE "EmailNotifications" ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT E'low';
