-- CreateEnum
CREATE TYPE "RolePriority" AS ENUM ('admin', 'volunteer', 'pupil', 'user');

-- CreateTable
CREATE TABLE "Roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "autoassign" BOOLEAN NOT NULL DEFAULT false,
    "priority" "RolePriority"[],

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles.name_unique" ON "Roles"("name");
