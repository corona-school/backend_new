import { baseTemplate, DEFAULTSENDERS } from './baseTemplate';

export class test_notification extends baseTemplate {
    templateID = 2672994;
    sender: string;
    receiver: string;
    notificationID: string;
    request: {
        From: { Email: string };
        To: [{ Email: string }];
        Subject: string;
        TemplateID: number;
        TemplateLanguage: boolean;
        variables: {
            cust_name: string;
            subject: string;
        };
    };

    constructor(
        receiver: string,
        variables: {
            cust_name: string;
            subject: string;
        },
        notificationId?: string
    ) {
        super();
        this.request = {
            From: { Email: DEFAULTSENDERS.test },
            To: [{ Email: receiver }],
            Subject: variables.subject,
            TemplateID: this.templateID,
            TemplateLanguage: true,
            variables: variables,
        };
        this.sender = DEFAULTSENDERS.test;
        this.receiver = receiver;
        this.notificationID =
            notificationId === undefined ? 'unsent' : notificationId;
    }

    getTemplate() {
        return this.request;
    }
}
