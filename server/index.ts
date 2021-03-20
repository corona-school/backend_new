import { ConfigureApollo } from '../apollo';
import express, { Request, Response, NextFunction } from 'express';
import { ConfigureREST } from '../rest';
import '../src/api/middlewares/passport-auth';
import { ConfigureLogger } from '../services/logger';
import { startNotificationHandler } from '../services/notificationHandler';
import { authentication } from '../src/api/routes/authRoute';
import { refreshToken } from '../src/api/routes/tokenRefreshRoute';
import { userdata } from '../src/api/routes/userDataRoute';
import { verification } from '../src/api/routes/verificationRoute';

const app = express();

app.use(express.json());
ConfigureLogger();
ConfigureApollo(app);
ConfigureREST(app);
authentication(app);
refreshToken(app);
userdata(app);
verification(app);

startNotificationHandler(30000);

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
