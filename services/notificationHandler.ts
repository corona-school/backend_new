import {
    getPendingEmailNotifications,
    getPendingTextNotifications,
    markTextNotification,
} from './dataStore';
import { logError, logInfo } from './logger';
import mailjet from 'node-mailjet';
import { test_notification } from '../mailTemplates/test_notification';

let mailjetTextAPI: mailjet.SMS.Client;

if (process.env.MAILJET_SMS_API === undefined) {
    logError('Mailjet API not configured properly');
} else {
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
                subject: string;
                status: string;
                variables: string;
                template: string;
            }) => {
                switch (notification.template) {
                    case '2672994':
                        const email = new test_notification(
                            notification.sender,
                            notification.recipientEmail,
                            JSON.parse(notification.variables),
                            notification.id
                        );
                        email
                            .delayed_send()
                            .then((res) => {
                                logInfo('Sent Notification ' + notification.id);
                            })
                            .catch((err) => {
                                logError(err);
                            });
                }
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
