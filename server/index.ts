import { ConfigureApollo } from '../apollo';
import express, { Request, Response, NextFunction} from 'express';
import cors from 'cors';
import { ConfigureREST } from '../rest';
import { ConfigureLogger, logInfo } from '../services/logger';
import { sendNotification, sendText } from '../services/notification';
import { startNotificationHandler } from '../services/notificationHandler';
import helmet from 'helmet';
import hpp from 'hpp';
import '../src/api/middlewares/passport-auth';
import { authentication } from '../src/api/routes/authRoute';
import { refreshToken } from '../src/api/routes/tokenRefreshRoute';
import { userdata } from '../src/api/routes/userDataRoute';
import { verification } from '../src/api/routes/verificationRoute';

const app = express();

app.use(express.json());
ConfigureLogger();
ConfigureCORS();
app.use(hpp());
app.use(helmet());
ConfigureApollo(app);
ConfigureREST(app);
authentication(app);
refreshToken(app);
userdata(app);
verification(app);

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

//Start the persistant notification handler.
startNotificationHandler(10000);

/*sendNotification('ayush.pandey@corona-school.de', {
    Subject: 'Test Message',
    Message: 'Hello from Mailjet',
});

*/
//sendText('+4917687984735', 'Welcome to Corona school');

/*
addUser({
    firstName: 'Ayush',
    lastName: 'Pandey',
    email: 'ayush.pandey@corona-school.de',
}).then((response) => console.log(response));


*/

function ConfigureCORS() {
    let requestOrigins;

    if (process.env.NODE_ENV === 'dev') {
        requestOrigins = [
            'http://localhost:3000',
            'https://web-user-app-live.herokuapp.com',
            'https://web-user-app-dev.herokuapp.com',
            /^https:\/\/cs-web-user-app-(pr-[0-9]+|br-[\-a-z0-9]+).herokuapp.com$/,
        ];
    } else {
        requestOrigins = [
            'https://dashboard.corona-school.de',
            'https://my.corona-school.de',
        ];
    }

    const options = {
        origin: requestOrigins,
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'HEAD', 'PATCH'],
    };

    app.use(cors(options));
}
