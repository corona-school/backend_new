-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL DEFAULT E'ayush.pandey@corona-school.de',
    "recipientEmail" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD FOREIGN KEY ("recipientEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
