export interface IEmailNotification {
    id: string;
    sender: string;
    recipientEmail: string;
    status: string;
    textContent: string | null;
    htmlContent: string | null;
    subject: string;
}

export interface ISMSNotification {
    id: string;
    sender: string;
    status: string;
    recipientPhone: string;
    text: string;
}
