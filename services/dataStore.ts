import { PrismaClient } from '@prisma/client';

import { logError } from './logger';

const prisma = new PrismaClient();

export async function addUser(details: {
    firstName: string;
    lastName: string | null;
    email: string;
    notificationLevel: 'all' | 'necessary';
}) {
    return prisma.user.create({ data: details });
}

export async function getPendingNotifications() {
    return prisma.notifications.findMany({
        where: {
            status: 'pending',
        },
    });
}

export async function addNotification(
    recipient: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
) {
    if (content.HTMLContent === undefined) {
        content.HTMLContent = '';
    }
    const user = prisma.user.findUnique({
        where: {
            email: recipient,
        },
    });

    user.then((response) => {
        if (response !== null) {
            return prisma.notifications.create({
                data: {
                    recipientEmail: recipient,
                    subject: content.Subject,
                    textContent: content.Message,
                    htmlContent: content.HTMLContent,
                },
            });
        } else {
            logError('Mail recipient ' + recipient + ' does not exist');
        }
    });
}

export async function markNotification(notificationId: string) {
    return prisma.notifications.update({
        where: {
            id: notificationId,
        },
        data: {
            status: 'sent',
        },
    });
}
