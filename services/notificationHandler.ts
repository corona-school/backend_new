import {
    getPendingEmailNotifications,
    getPendingTextNotifications,
    markEmailNotification,
    markTextNotification,
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

    mailjetTextAPI = mailjet.connect(process.env.MAILJET_SMS_API, {
        url: 'api.mailjet.com',
        version: 'v4',
        perform_api_call: true,
    });
}

export const startNotificationHandler = (interval: number) => {
    logInfo('Started Notification Handler');
    setInterval(notificationHandler, interval);
};

function notificationHandler(_action: string) {
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
                const sendEmail = mailjetEmailAPI
                    .post('send', { version: 'v3.1' })
                    .request({
                        Messages: [
                            {
                                From: {
                                    Email: notification.sender,
                                    Name: 'Corona School - Notification',
                                },
                                To: [
                                    {
                                        Email: notification.recipientEmail,
                                    },
                                ],
                                Subject: notification.subject,
                                TextPart: notification.textContent,
                                HTMLPart: notification.htmlContent,
                                CustomID: notification.id,
                            },
                        ],
                    });

                sendEmail
                    .then((_response) => {
                        markEmailNotification(notification.id, 'sent');
                    })
                    .catch((err) => {
                        markEmailNotification(notification.id, 'error');
                        logError(
                            'Email ' +
                                notification.id +
                                ' could not be sent, Error:: ' +
                                err
                        );
                    });
            }
        );
    });

    getPendingTextNotifications()
        .then((notifications) => {
            notifications.forEach(
                (notification: {
                    id: string;
                    sender: string;
                    status: string;
                    recipientPhone: string;
                    text: string;
                }) => {
                    const sendText = mailjetTextAPI.post('sms-send').request({
                        Text: notification.text,
                        To: notification.recipientPhone,
                        From: notification.sender,
                    });

                    sendText
                        .then((_response) => {
                            markTextNotification(notification.id, 'sent');
                        })
                        .catch((err) => {
                            markTextNotification(notification.id, 'error');
                            logError(
                                'Text ' +
                                    notification.id +
                                    ' Count not be sent, Error:: ' +
                                    err
                            );
                        });
                }
            );
        })
        .catch((err) => {
            logError(
                'Problem getting messages from the database. Error:: ' + err
            );
        });
}
