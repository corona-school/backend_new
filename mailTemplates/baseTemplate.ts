import mailjet from 'node-mailjet';
import { logError } from '../services/logger';
import {
    addEmailNotification,
    markEmailNotification,
} from '../services/dataStore';

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

    forced_send() {
        return new Promise<{ status: number; res: string }>(
            (resolve, reject) => {
                const emailAPI = mailjetEmailAPI
                    .post('send', { version: 'v3.1' })
                    .request({
                        Messages: [this.request],
                    });
                emailAPI
                    .then((response) => {
                        const email = addEmailNotification(
                            this.receiver,
                            this.sender,
                            this.request.Subject,
                            this.request.TemplateID,
                            this.request.variables,
                            'sent',
                            'high'
                        );
                        email
                            .then((response) => {
                                this.notificationID = response.res;
                                resolve({
                                    status: 200,
                                    res: 'Email sent successfully',
                                });
                            })
                            .catch((err) => {
                                reject({
                                    status: 400,
                                    res:
                                        'Email sent but not added in the notification list. Error: ' +
                                        err,
                                });
                            });
                    })
                    .catch((err) => {
                        reject({
                            status: 400,
                            res: 'Could not send email. Error ' + err,
                        });
                    });
            }
        );
    }

    delayed_send() {
        return new Promise<{ status: number; res: string }>(
            (resolve, reject) => {
                if (
                    this.notificationID === undefined ||
                    this.notificationID === 'unsent'
                ) {
                    logError(
                        'Cannot delay-send a message which has not been added to the pending list'
                    );
                    reject({
                        status: 400,
                        res:
                            'Cannot delay-send a message which has not been added to the pending list',
                    });
                } else {
                    const email = mailjetEmailAPI
                        .post('send', { version: 'v3.1' })
                        .request({
                            Messages: [this.request],
                        });
                    email
                        .then((_response) => {
                            markEmailNotification(this.notificationID, 'sent')
                                .then((res) => {
                                    resolve({
                                        status: 200,
                                        res: 'Email sent successfully',
                                    });
                                })
                                .catch((err) => {
                                    reject({
                                        status: 400,
                                        res:
                                            'There was a problem sending the email. Error:' +
                                            err,
                                    });
                                });
                        })
                        .catch((err) => {
                            reject({
                                status: 400,
                                res:
                                    'There was a problem sending the email. Error:' +
                                    err,
                            });
                            markEmailNotification(this.notificationID, 'error');
                            logError(
                                'Email ' +
                                    this.notificationID +
                                    ' could not be sent, Error:: ' +
                                    err
                            );
                        });
                }
            }
        );
    }

    defer() {
        return new Promise<{ status: number; res: string }>(
            (resolve, reject) => {
                const email = addEmailNotification(
                    this.receiver,
                    this.sender,
                    this.request.Subject,
                    this.request.TemplateID,
                    this.request.variables
                );
                email
                    .then((response) => {
                        this.notificationID = response.res;
                        resolve({
                            status: 400,
                            res: 'Email added to the pending list',
                        });
                    })
                    .catch((err) => {
                        reject({
                            status: 400,
                            res: err,
                        });
                    });
            }
        );
    }
}
