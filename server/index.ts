import { ConfigureApollo } from '../apollo';
import express from 'express';
import { ConfigureREST } from '../rest';
import { ConfigureLogger, logInfo } from '../services/logger';
import { sendNotification } from '../services/notification';
import { startNotificationHandler } from '../services/notificationHandler';
const app = express();

sendNotification('ayushpandey@corona-school.de', {
    Subject: 'Test Message',
    Message: 'Hello from Mailjet',
});

ConfigureApollo(app);
ConfigureREST(app);
ConfigureLogger();
startNotificationHandler(10000);

app.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`)
);
/*
addUser({
    firstName: 'Ayush',
    lastName: 'Pandey',
    email: 'ayush.pandey@corona-school.de',
}).then((response) => console.log(response));
*/
