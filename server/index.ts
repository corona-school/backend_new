import { ConfigureApollo } from '../apollo';
import express, { Request, Response, NextFunction, response } from 'express';
import cors from 'cors';
import { ConfigureREST } from '../rest';
import { ConfigureLogger } from '../services/logger';
import { startNotificationHandler } from '../services/notificationHandler';
import helmet from 'helmet';
import hpp from 'hpp';
import '../middlewares/auth';
import { authentication } from '../routes/auth';
import { token } from '../routes/tokenRefresh';
import { userdata } from '../routes/userData';
import { verification } from '../routes/verification';
import { roles } from '../routes/roles';

const app = express();

app.use(express.json());
ConfigureLogger();
ConfigureCORS();
app.use(hpp());
app.use(helmet());
ConfigureApollo(app);
ConfigureREST(app);
authentication(app);
token(app);
userdata(app);
verification(app);
roles(app);


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

//Start the persistant notification handler.
startNotificationHandler(10000);

function ConfigureCORS() {
    let requestOrigins;

    if (process.env.NODE_ENV === 'dev') {
        requestOrigins = [
            'http://localhost:3000',
            'https://web-user-app-live.herokuapp.com',
            'https://web-user-app-dev.herokuapp.com',
            /^https:\/\/cs-web-user-app-(pr-[0-9]+|br-[-a-z0-9]+).herokuapp.com$/,
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

export const server = app.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`)
);
