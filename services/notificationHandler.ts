import { getPendingNotifications, markNotification } from './datastore';
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
