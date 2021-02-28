import { getPendingNotifications, markNotification } from './dataStore';
import { logError, logInfo } from './logger';
import mailjet from 'node-mailjet';

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

function notificationHandler() {
    getPendingNotifications().then((notifications) => {
        notifications.forEach(
            (notification: {
                id: string;
                sender: string;
                recipientEmail: string;
                status: string;
                textContent: string | null;
                htmlContent: string | null;
                subject: string;
            }) => {
                mailjetAPI.post('send', { version: 'v3.1' }).request({
                    Messages: [
                        {
                            From: {
                                Email: process.env.SENDER_EMAIL,
                                Name: process.env.SENDER_NAME,
                            },
                            To: [
                                {
                                    Email: notification.recipientEmail,
                                    Name: 'Ayush',
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
            }
        );
    });
}
