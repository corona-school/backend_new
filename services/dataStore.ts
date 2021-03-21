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
    const user = prisma.user.findUnique({
        where: {
            phone: recipient,
        },
    });
    user.then((response) => {
        if (response !== null) {
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
    }).catch((err) => {
        logError('Unable to fetch data from the database. Error:: ' + err);
    });
}

export async function addEmailNotification(
    recipient: string,
    sender: string,
    subject: string,
    templateID: number,
    variables: object,
    status?: 'pending' | 'sent' | undefined
) {
    return new Promise<{ status: number; res: string }>((resolve, reject) => {
        const user = prisma.user.findUnique({
            where: {
                email: recipient,
            },
        });
        user.then((response) => {
            if (response !== null) {
                prisma.emailNotifications
                    .create({
                        data: {
                            recipientName: response.firstName,
                            recipientEmail: recipient,
                            sender: sender,
                            subject: subject,
                            variables: JSON.stringify(variables),
                            template: templateID.toString(),
                            status: status === undefined ? 'pending' : status,
                        },
                    })
                    .then((res) => {
                        resolve({
                            status: 200,
                            res: res.id,
                        });
                    })
                    .catch((err) => {
                        reject({
                            status: 400,
                            res:
                                'Problem adding email to the pending list. Error:' +
                                err,
                        });
                    });
            } else {
                logError('Mail recipient ' + recipient + ' does not exist');
                reject({
                    status: 400,
                    res: 'Mail recipient ' + recipient + ' does not exist',
                });
            }
        }).catch((err) => {
            logError('Unable to fetch data from the database. Error:: ' + err);
            reject({
                status: 400,
                res: 'Error occurred while fetching the data. Error:' + err,
            });
        });
    });
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
