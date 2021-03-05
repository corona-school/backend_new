import { ConfigureApollo } from '../apollo';
import express from 'express';
import cors from 'cors';
import { ConfigureREST } from '../rest';
import { ConfigureLogger, logInfo } from '../services/logger';
import { sendNotification, sendText } from '../services/notification';
import { startNotificationHandler } from '../services/notificationHandler';
import helmet from 'helmet';
import hpp from 'hpp';
const app = express();

ConfigureApollo(app);
ConfigureREST(app);
ConfigureLogger();
ConfigureCORS();
app.use(hpp());
app.use(helmet());

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
//sendText('+49017674853265', 'Welcome to Corona school');

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
