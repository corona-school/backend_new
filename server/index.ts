import { ConfigureApollo } from '../apollo';
import express, { Request, Response, NextFunction } from 'express';
import { ConfigureREST } from '../rest';
import '../rest/middleware/auth';
import { ConfigureLogger } from '../services/logger';
import { sendNotification, sendText } from '../services/notification';
import { startNotificationHandler } from '../services/notificationHandler';
import { authentication } from '../rest/routes/authentication';
import { ResetPassword } from '../rest/routes/resetPassword';
import { refreshToken } from '../rest/routes/refreshToken';
import { emailsVerification } from '../rest/routes/verifyEmail';
import { PhoneVerification } from '../rest/routes/verifyPhone';

const app = express();

// sendNotification('farrukh.faizy@corona-school.de', {
//     Subject: 'Test Message',
//     Message: 'Hello from Mailjet # 1',
// });

app.use(express.json());
ConfigureLogger();
ConfigureApollo(app);
ConfigureREST(app);
authentication(app);
ResetPassword(app);
refreshToken(app);
emailsVerification(app);
PhoneVerification(app);

startNotificationHandler(10000);

app.use((req, res, next) => {
    const err = new Error('Not found');
    next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500);
    res.send({
        error: {
            name: err.name,
            message: err.message,
        },
    });
});

app.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`)
);
