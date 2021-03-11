import { getPendingNotifications, markNotification } from './dataStore';
import { logError, logInfo } from './logger';
import mailjet from 'node-mailjet';
import { response } from 'express';

let mailjetAPI: mailjet.Email.Client;
if (
    process.env.MAILJET_API === undefined ||
    process.env.MAILJET_SECRET === undefined
) {
    logError('Mailjet API not configured properly');
} else {
    mailjetAPI = mailjet.connect(
        process.env.MAILJET_API,
        process.env.MAILJET_SECRET
    );
}

export const startNotificationHandler = (interval: number) => {
    logInfo('Started Notification Handler');
    setInterval(notificationHandler, interval);
};

export const resetNotification = (
    recipient: { email: string; firstName: string },
    content: { Subject: string; Message: string; HTMLContent?: string }
) => {
    const request = mailjetAPI.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: 'backend@corona-school.de',
                    Name: 'backend',
                },
                To: [
                    {
                        Email: recipient.email,
                        Name: recipient.firstName,
                    },
                ],
                Subject: content.Subject,
                TextPart: content.Message,
            },
        ],
    });

    request
        .then((result) => {
            console.log(result.body);
        })
        .catch((err) => {
            console.log(err.statusCode);
        });
};

function notificationHandler() {
    getPendingNotifications().then((notifications) => {
        notifications.forEach((notification) => {
            mailjetAPI.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'farrukh.faizy@corona-school.de',
                            Name: 'faizy',
                        },
                        To: [
                            {
                                Email: 'farrukh.faizy@gmail.com',
                                Name: 'faizy',
                            },
                        ],
                        Subject: notification.subject,
                        TextPart: notification.textContent,
                        HTMLPart: notification.htmlContent,
                        CustomID: notification.id,
                    },
                ],
            });
            markNotification(notification.id).then((response) =>
                logInfo('Mark notification ' + notification.id + ' sent')
            );
        });
    });
}
