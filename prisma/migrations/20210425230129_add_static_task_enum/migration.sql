/*
  Warnings:

  - Changed the type of `name` on the `Tasks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "userTasks" AS ENUM ('createTask', 'updateTask');

-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "name",
ADD COLUMN     "name" "userTasks" NOT NULL;
