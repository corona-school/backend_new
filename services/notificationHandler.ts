import { logError, logInfo } from './logger';
import mailjet from 'node-mailjet';
import { test_notification } from '../mailjet/mailTemplates/test_notification';
import { sms } from '../mailjet/smsTemplates/sms';
import {
    getPendingEmailNotifications,
    getPendingTextNotifications,
} from '../dataStore/dataStore';

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

export async function runNotificationHandlerOnce() {
    await notificationHandler('');
}

async function notificationHandler(_action: string) {
    try {
        const emailNotifications = await getPendingEmailNotifications();
        emailNotifications.forEach(
            (notification: {
                id: string;
                sender: string;
                recipientEmail: string;
                subject: string;
                status: string;
                variables: string;
                template: string;
            }) => {
                let email = undefined;
                switch (notification.template) {
                    case '2672994':
                        {
                            email = new test_notification(
                                notification.recipientEmail,
                                JSON.parse(notification.variables),
                                notification.id
                            );
                        }
                        break;
                    default: {
                        email = new test_notification(
                            notification.recipientEmail,
                            JSON.parse(notification.variables),
                            notification.id
                        );
                    }
                }
                email
                    .delayed_send()
                    .then((res) => {
                        logInfo('Sent Notification ' + notification.id);
                    })
                    .catch((err) => {
                        logError(err);
                    });
            }
        );
    } catch (e) {
        logError('Problem getting notifications from the database. Error:' + e);
    }

    try {
        const textNotifications = await getPendingTextNotifications();
        textNotifications.forEach(
            (notification: {
                id: string;
                sender: string;
                status: string;
                recipientPhone: string;
                text: string;
            }) => {
                const sendText = new sms(
                    notification.recipientPhone,
                    notification.text,
                    notification.id
                );
                sendText
                    .delayed_send()
                    .then((res) => {
                        logInfo('Sent Notification ' + notification.id);
                    })
                    .catch((err) => {
                        logError(err);
                    });
            }
        );
    } catch (e) {
        logError('Problem getting notifications from the database. Error:' + e);
    }
}
