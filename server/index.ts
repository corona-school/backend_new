import { ConfigureApollo } from '../apollo';
import express from 'express';
import cors from 'cors';
import { ConfigureREST } from '../rest';
import { ConfigureLogger, logError, logInfo } from '../services/logger';
import { startNotificationHandler } from '../services/notificationHandler';
import helmet from 'helmet';
import hpp from 'hpp';
import { sendNotification } from '../services/notification';
import { test_notification } from '../mailTemplates/test_notification';
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
/*
const email = new test_notification(
    '"Corona School Team" <backend@corona-school.de>',
    'ayush.pandey@corona-school.de',
    { subject: 'Test Send Message', cust_name: 'Ayush' }
);
email
    .defer()
    .then((res) => {
        logInfo(res.res);
    })
    .catch((err) => {
        logError(err);
    });
*/
const email = new test_notification(
    '"Corona School Team" <backend@corona-school.de>',
    'ayush.pandey@corona-school.de',
    { subject: 'Forced Send Message', cust_name: 'Ayush' }
);

email
    .forced_send()
    .then((res) => {
        logInfo(res.res);
    })
    .catch((err) => {
        logError(err);
    });
//sendNotification('ayush.pandey@corona-school.de', 'Test Message', '2672994');
//sendText('+4917687984735', 'Welcome to Corona school');

/*
addUser({
    firstName: 'Ayush',
    lastName: 'Pandey',
    email: 'ayush.pandey@corona-school.de',
}).then((response) => console.log(response));


*/

/*
sendEmailNotification('ayush.pandey@corona-school.de', {
    cust_name: 'Ayush',
    subject: 'Hello',
});*/

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
