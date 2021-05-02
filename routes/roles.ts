import express from 'express';
import { assignRole, newRole } from '../controllers/rolesController';
import passport from 'passport';

export const roles = (app: express.Application): void => {
    const rolesRoute = express.Router();
    rolesRoute.get('/ping', (req, res) => res.send('pong').status(200).end());
    rolesRoute.post(
        '/new',
        passport.authenticate('jwt', { session: false }),
        newRole
    );
    rolesRoute.post(
        '/assign',
        passport.authenticate('jwt', { session: false }),
        assignRole
    );
    app.use('/roles', rolesRoute);
};
