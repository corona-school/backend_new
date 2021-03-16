import { addNotification, addTextNotification } from './dataStore';
import { logInfo } from './logger';

const DEFAULTSENDERS = {
    anmeldung: '"Corona School Team" <anmeldung@corona-school.de>',
    noreply: '"Corona School Team" <noreply@corona-school.de>',
    screening: '"Corona School Team" <screening@corona-school.de>',
    support: '"Corona School Team" <support@corona-school.de>',
    sms: 'CoronaSchoo',
};

export const sendNotification = (
    recipient: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
): void => {
    addNotification(recipient, DEFAULTSENDERS.noreply, content);
};

export const sendText = (recipient: string, message: string): void => {
    addTextNotification(DEFAULTSENDERS.sms, recipient, message);
};
