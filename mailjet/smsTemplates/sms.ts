import { baseTemplate } from '../smsTemplates/baseTemplate';

export class sms extends baseTemplate {
    notificationID: string;
    receiver: string;
    request: { Text: string; To: string; From: string };
    sender: string;
    text: string;

    constructor(receiver: string, text: string, notificationId?: string) {
        super();
        this.sender = 'CoronaSchoo';
        this.receiver = receiver;
        this.text = text;
        this.notificationID =
            notificationId === undefined ? 'unsent' : notificationId;
        this.request = {
            Text: text,
            To: receiver,
            From: 'CoronaSchoo',
        };
    }
}
