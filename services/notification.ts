import { addNotification } from './dataStore';
import { logInfo } from './logger';
import { resetNotification } from './notificationHandler';

export const sendNotification = (
    recipient: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
): void => {
    addNotification(recipient, content);
};

export const sendResetNotification = (
    recipient: { email: string; firstName: string },
    content: { Subject: string; Message: string; HTMLContent?: string }
): void => {
    resetNotification(recipient, content);
};
