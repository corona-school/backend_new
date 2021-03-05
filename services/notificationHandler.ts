import {
    getPendingEmailNotifications,
    getPendingTextNotifications,
    markEmailNotification,
} from './dataStore';
import { logError, logInfo } from './logger';
import mailjet from 'node-mailjet';

let mailjetEmailAPI: mailjet.Email.Client;
let mailjetTextAPI: mailjet.SMS.Client;
if (
    process.env.MAILJET_API === undefined ||
    process.env.MAILJET_SECRET === undefined ||
    process.env.MAILJET_SMS_API === undefined
) {
    logError('Mailjet API not configured properly');
} else {
    mailjetEmailAPI = mailjet.connect(
        process.env.MAILJET_API,
        process.env.MAILJET_SECRET
    );

    //mailjetTextAPI = mailjet.connect(process.env.MAILJET_SMS_API);
}

export const startNotificationHandler = (interval: number) => {
    logInfo('Started Notification Handler');
    setInterval(notificationHandler, interval);
};

function notificationHandler(action: string) {
    getPendingEmailNotifications().then((notifications) => {
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
                mailjetEmailAPI.post('send', { version: 'v3.1' }).request({
                    Messages: [
                        {
                            From: {
                                Email: notification.sender,
                                Name: 'Corona School - Notification',
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
                markEmailNotification(notification.id).then((_response) =>
                    logInfo('Mark notification ' + notification.id + ' sent')
                );
            }
        );
    });

    getPendingTextNotifications().then((notifications) => {
        notifications.forEach(
            (notification: {
                id: string;
                sender: string;
                status: string;
                recipientPhone: string;
                text: string;
            }) => {
                console.log('Send SMS');
                mailjetEmailAPI.post('sms-send', { version: 'v4' }).request({
                    Text: notification.text,
                    To: notification.recipientPhone,
                    From: notification.sender,
                });
            }
        );
    });
}
