import { addNotification } from './dataStore';
import { logInfo } from './logger';

export const sendNotification = (
    recipient: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
): void => {
    addNotification(recipient, content);
};