import {
    getPendingEmailNotifications,
    getPendingTextNotifications,
    markEmailNotification,
    markTextNotification,
} from './dataStore';
import { logError, logInfo } from './logger';
import { sendEmailHandler, sendSMSHandler } from '../mailjet';

export const startNotificationHandler = (interval: number): void => {
    logInfo('Started Notification Handler');
    setInterval(notificationHandler, interval);
};

async function notificationHandler() {
    try {
        const pendingEmailNotifications = await getPendingEmailNotifications();
        await Promise.all(
            pendingEmailNotifications.map((n) => {
                try {
                    sendEmailHandler(n);
                    return markEmailNotification(n.id, 'sent');
                } catch (err) {
                    logError(`Email ${n.id} could note be sent, Error::${err}`);
                    return markEmailNotification(n.id, 'error');
                }
            })
        );
    } catch (err) {
        logError(`Failed to handle email notifications, Error::${err}`);
    }

    try {
        const pendingTextNotifications = await getPendingTextNotifications();
        await Promise.all(
            pendingTextNotifications.map((n) => {
                try {
                    sendSMSHandler(n);
                    return markTextNotification(n.id, 'sent');
                } catch (err) {
                    logError(`SMS ${n.id} could note be sent, Error::${err}`);
                    return markTextNotification(n.id, 'error');
                }
            })
        );
    } catch (err) {
        logError(`Failed to handle text notifications, Error::${err}`);
    }
}
