import { addTextNotification } from './dataStore';

const DEFAULTSENDERS = {
    anmeldung: '"Corona School Team" <anmeldung@corona-school.de>',
    noreply: '"Corona School Team" <noreply@corona-school.de>',
    screening: '"Corona School Team" <screening@corona-school.de>',
    support: '"Corona School Team" <support@corona-school.de>',
    test: '"Corona School Team" <backend@corona-school.de>',
    sms: 'CoronaSchoo',
};


export const sendText = (recipient: string, message: string): void => {
    addTextNotification(DEFAULTSENDERS.sms, recipient, message);
};
