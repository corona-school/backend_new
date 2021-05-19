import express from 'express';
import {
    assignRole, removeRole,
} from '../controllers/rolesController';
import passport from 'passport';
import { checkRole } from '../utils/roleAuthorization';

export const roles = (app: express.Application): void => {
    const rolesRoute = express.Router();
    rolesRoute.get('/ping', (req, res) => res.send('pong').status(200).end());
    rolesRoute.post(
        '/assign',
        passport.authenticate('jwt', { session: false }),
        checkRole(['unitTestAdmin', 'admin']),
        assignRole
    );
    rolesRoute.post(
        '/remove',
        passport.authenticate('jwt', { session: false }),
        checkRole(['unitTestAdmin', 'admin']),
        removeRole
    );
    app.use('/roles', rolesRoute);
};
