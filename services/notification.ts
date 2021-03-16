import { addNotification, addTextNotification } from './dataStore';

const DEFAULTSENDERS = {
    anmeldung: '"Corona School Team" <anmeldung@corona-school.de>',
    noreply: '"Corona School Team" <noreply@corona-school.de>',
    screening: '"Corona School Team" <screening@corona-school.de>',
    support: '"Corona School Team" <support@corona-school.de>',
    backend: '"Corona School Team" <backend@corona-school.de>',
    sms: 'CoronaSchool',
};

export const sendNotification = (
    recipient: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
): void => {
    addNotification(recipient, DEFAULTSENDERS.backend, content);
};

export const sendText = (recipient: string, message: string): void => {
    addTextNotification(DEFAULTSENDERS.sms, recipient, message);
};
