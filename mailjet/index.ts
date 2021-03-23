import mailjet from 'node-mailjet';
import { logError } from '../services/logger';
import { IEmailNotification, ISMSNotification } from './format';

let mailjetEmailAPI: mailjet.Email.Client;
let mailjetTextAPI: mailjet.SMS.Client;

if (
    process.env.MAILJET_API === undefined ||
    process.env.MAILJET_SECRET === undefined
) {
    logError('Mailjet Email API not configured properly');
} else {
    mailjetEmailAPI = mailjet.connect(
        process.env.MAILJET_API,
        process.env.MAILJET_SECRET
    );
}

if (process.env.MAILJET_SMS_API === undefined) {
    logError('Mailjet SMS API not configured properly');
} else {
    mailjetTextAPI = mailjet.connect(process.env.MAILJET_SMS_API, {
        url: 'api.mailjet.com',
        version: 'v4',
        perform_api_call: true,
    });
}

export async function sendEmailHandler(
    notification: IEmailNotification
): Promise<mailjet.Email.Response> {
    return mailjetEmailAPI.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: notification.sender,
                    Name: 'Corona School - Notification',
                },
                To: [
                    {
                        Email: notification.recipientEmail,
                    },
                ],
                Subject: notification.subject,
                TextPart: notification.textContent,
                HTMLPart: notification.htmlContent,
                CustomID: notification.id,
            },
        ],
    });
}

export async function sendSMSHandler(
    notification: ISMSNotification
): Promise<mailjet.SMS.SendResponse> {
    return mailjetTextAPI.post('sms-send').request({
        Text: notification.text,
        To: notification.recipientPhone,
        From: notification.sender,
    });
}
