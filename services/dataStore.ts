import { PrismaClient } from '@prisma/client';
import { logError } from './logger';

const prisma = new PrismaClient();

export async function addUser(details: {
    firstName: string;
    lastName: string | null;
    email: string;
    notificationLevel: 'all' | 'necessary';
    phone: string;
}) {
    return prisma.user.create({ data: details });
}

export async function getPendingEmailNotifications() {
    return prisma.emailNotifications.findMany({
        where: {
            status: 'pending',
        },
    });
}

export async function getPendingTextNotifications() {
    return prisma.textNotifications.findMany({
        where: {
            status: 'pending',
        },
    });
}

export async function addTextNotification(
    sender: string,
    recipient: string,
    message: string
) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                phone: recipient,
            },
        });

        if (user?.phone) {
            return prisma.textNotifications.create({
                data: {
                    sender: sender,
                    recipientPhone: recipient,
                    text: message,
                },
            });
        } else {
            logError('Text Message recipient ' + recipient + ' does not exist');
        }
    } catch (err) {
        logError('Unable to fetch data from the database. Error:: ' + err);
    }
}

export async function addEmailNotification(
    recipient: string,
    sender: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
) {
    if (content.HTMLContent === undefined) {
        content.HTMLContent = '';
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: recipient,
            },
        });
        if (user) {
            return prisma.emailNotifications.create({
                data: {
                    recipientName: user.firstName,
                    recipientEmail: user.email,
                    sender: sender,
                    subject: content.Subject,
                    textContent: content.Message,
                    htmlContent: content.HTMLContent,
                },
            });
        } else {
            logError('Mail recipient ' + recipient + ' does not exist');
        }
    } catch (err) {
        logError('Unable to add email notification. Error:: ' + err);
    }
}

export async function markEmailNotification(
    notificationId: string,
    status: 'sent' | 'error'
) {
    return prisma.emailNotifications.update({
        where: {
            id: notificationId,
        },
        data: {
            status: status,
        },
    });
}

export async function markTextNotification(
    notificationId: string,
    status: 'sent' | 'error'
) {
    return prisma.textNotifications.update({
        where: {
            id: notificationId,
        },
        data: {
            status: status,
        },
    });
}
