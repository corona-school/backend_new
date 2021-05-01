-- DropIndex
DROP INDEX "Volunteer_userId_unique";

-- DropIndex
DROP INDEX "Pupil_userId_unique";

-- CreateTable
CREATE TABLE "AuthenticationData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuthenticationData" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
