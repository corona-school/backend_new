import { addEmailNotification, addTextNotification } from './dataStore';

const DEFAULTSENDERS = {
    anmeldung: '"Corona School Team" <anmeldung@corona-school.de>',
    noreply: '"Corona School Team" <noreply@corona-school.de>',
    screening: '"Corona School Team" <screening@corona-school.de>',
    support: '"Corona School Team" <support@corona-school.de>',
    backend: '"Corona School Team" <backend@corona-school.de>',
    sms: 'CoronaSchoo',
};

export const sendNotification = (
    recipient: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
): void => {
    const result = addEmailNotification(
        recipient,
        DEFAULTSENDERS.backend,
        content
    );
};

export const sendText = async (
    recipient: string,
    message: string
): Promise<void> => {
    await addTextNotification(DEFAULTSENDERS.sms, recipient, message);
};
