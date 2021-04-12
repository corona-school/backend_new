import { baseTemplate, DEFAULTSENDERS } from './baseTemplate';

export class resetPasswordNotification extends baseTemplate {
    templateID = 2792964;
    notificationID: string;
    receiver: string;
    request: {
        From: { Email: string };
        To: [{ Email: string }];
        Subject: string;
        TemplateID: number;
        TemplateLanguage: boolean;
        variables: object;
    };
    sender: string;

    getTemplate(
        sender: string,
        receiver: string,
        subject: string,
        variables: object
    ): object {
        return this.request;
    }

    constructor(
        receiver: string,
        variables: {
            subject: string;
            firstname: string;
            verification_email: string;
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
}
