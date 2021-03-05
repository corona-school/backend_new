import { ConfigureApollo } from '../apollo';
import express, { Request, Response, NextFunction } from 'express';
import { ConfigureREST } from '../rest';
import '../rest/middleware/auth';
import { ConfigureLogger } from '../services/logger';

const app = express();

app.use(express.json());
ConfigureLogger();
ConfigureApollo(app);
ConfigureREST(app);

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
