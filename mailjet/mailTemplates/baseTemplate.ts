import mailjet from 'node-mailjet';
import { logError } from '../../services/logger';
import {
    addEmailNotification,
    markEmailNotification,
} from '../../dataStore/dataStore';

export const DEFAULTSENDERS = {
    anmeldung: '"Corona School Team" <anmeldung@corona-school.de>',
    noreply: '"Corona School Team" <noreply@corona-school.de>',
    screening: '"Corona School Team" <screening@corona-school.de>',
    support: '"Corona School Team" <support@corona-school.de>',
    test: '"Corona School Team" <backend@corona-school.de>',
};

let mailjetEmailAPI: mailjet.Email.Client;
if (
    process.env.MAILJET_API === undefined ||
    process.env.MAILJET_SECRET === undefined
) {
    logError('Mailjet API not configured properly');
} else {
    mailjetEmailAPI = mailjet.connect(
        process.env.MAILJET_API,
        process.env.MAILJET_SECRET
    );
}

export abstract class baseTemplate {
    abstract notificationID: string;
    abstract templateID: number;
    abstract sender: string;
    abstract receiver: string;
    abstract request: {
        From: {
            Email: string;
        };
        To: [
            {
                Email: string;
            }
        ];
        Subject: string;
        TemplateID: number;
        TemplateLanguage: boolean;
        variables: object;
    };

    abstract getTemplate(
        sender: string,
        receiver: string,
        subject: string,
        variables: object
    ): object;

    async forced_send(): Promise<{ status: number; res: string }> {
        try {
            const emailAPI = await mailjetEmailAPI
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [this.request],
                });

            const email = await addEmailNotification(
                this.receiver,
                this.sender,
                this.request.Subject,
                this.request.TemplateID,
                this.request.variables,
                'sent',
                'high'
            );
            this.notificationID = email.res;

            return {
                status: 200,
                res: this.notificationID,
            };
        } catch (err) {
            return {
                status: 400,
                res: 'Could not send email. Error ' + err,
            };
        }
    }

    async delayed_send(): Promise<{ status: number; res: string }> {
        if (
            this.notificationID === undefined ||
            this.notificationID === 'unsent'
        ) {
            logError(
                'Cannot delay-send a message which has not been added to the pending list'
            );
            return {
                status: 400,
                res:
                    'Cannot delay-send a message which has not been added to the pending list',
            };
        } else {
            try {
                const email = await mailjetEmailAPI
                    .post('send', { version: 'v3.1' })
                    .request({
                        Messages: [this.request],
                    });
                try {
                    const marked = await markEmailNotification(
                        this.notificationID,
                        'sent'
                    );
                } catch (err) {
                    logError(
                        'Email ' +
                            this.notificationID +
                            ' could not be marked sent, Error:: ' +
                            err
                    );
                }

                return {
                    status: 200,
                    res: 'Email sent successfully',
                };
            } catch (err) {
                logError(
                    'Email ' +
                        this.notificationID +
                        ' could not be sent, Error:: ' +
                        err
                );

                try {
                    await markEmailNotification(this.notificationID, 'error');
                } catch (err) {
                    logError(
                        'Email ' +
                            this.notificationID +
                            ' could not be marked error, Error:: ' +
                            err
                    );
                }
                return {
                    status: 400,
                    res: 'There was a problem sending the email. Error:' + err,
                };
            }
        }
    }

    async defer(): Promise<{ status: number; res: string }> {
        try {
            const email = await addEmailNotification(
                this.receiver,
                this.sender,
                this.request.Subject,
                this.request.TemplateID,
                this.request.variables
            );
            this.notificationID = email.res;
            return {
                status: 200,
                res: this.notificationID,
            };
        } catch (e) {
            return {
                status: 400,
                res: e,
            };
        }
    }
}
