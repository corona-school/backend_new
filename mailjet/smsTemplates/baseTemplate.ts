import mailjet from 'node-mailjet';
import { logError } from '../../services/logger';
import {
    addTextNotification,
    markTextNotification,
} from '../../dataStore/dataStore';

let mailjetTextAPI: mailjet.SMS.Client;

if (process.env.MAILJET_SMS_API === undefined) {
    logError('Mailjet API not configured properly');
} else {
    mailjetTextAPI = mailjet.connect(process.env.MAILJET_SMS_API, {
        url: 'api.mailjet.com',
        version: 'v4',
        perform_api_call: true,
    });
}

export abstract class baseTemplate {
    abstract notificationID: string;
    abstract sender: string;
    abstract receiver: string;
    abstract text: string;
    abstract request: {
        Text: string;
        To: string;
        From: string;
    };

    async forced_send(): Promise<{ status: number; res: string }> {
        try {
            const sms = await addTextNotification(
                this.sender,
                this.receiver,
                this.text,
                'sent'
            );
            const smsAPI = await mailjetTextAPI
                .post('sms-send')
                .request(this.request);

            this.notificationID = sms.res;
            return {
                status: 200,
                res: this.notificationID,
            };
        } catch (err) {
            return {
                status: 400,
                res: 'Could not send text. Error ' + err,
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
                const email = await mailjetTextAPI
                    .post('sms-send')
                    .request(this.request);
                try {
                    const marked = await markTextNotification(
                        this.notificationID,
                        'sent'
                    );
                } catch (err) {
                    logError(
                        'Text ' +
                            this.notificationID +
                            ' could not be marked sent, Error:: ' +
                            err
                    );
                }

                return {
                    status: 200,
                    res: 'Text sent successfully',
                };
            } catch (err) {
                logError(
                    'Text ' +
                        this.notificationID +
                        ' could not be sent, Error:: ' +
                        err
                );

                try {
                    await markTextNotification(this.notificationID, 'error');
                } catch (err) {
                    logError(
                        'Text ' +
                            this.notificationID +
                            ' could not be marked error, Error:: ' +
                            err
                    );
                }
                return {
                    status: 400,
                    res: 'There was a problem sending the SMS. Error:' + err,
                };
            }
        }
    }

    async defer(): Promise<{ status: number; res: string }> {
        try {
            const text = await addTextNotification(
                this.sender,
                this.receiver,
                this.text
            );
            this.notificationID = text.res;
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
