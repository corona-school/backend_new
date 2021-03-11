import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logError, logInfo } from '../../services/logger';
import { registerDataSchema } from '../../utils/validationSchema';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { signAccessToken, signRefreshToken } from '../../utils/jwt_signature';
import { keys } from '../../utils/secretKeys';

const prisma = new PrismaClient();

export const authentication = (app: express.Application): void => {
    const authApi = express.Router();
    authApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    authApi.post(
        '/signup',
        async (req: Request, res: Response, next: NextFunction) => {
            const { error, value } = registerDataSchema.validate(req.body);
            const { firstName, lastName, email, password } = value;
            logInfo(
                `Register route initiated with params Name:${firstName} lastname:${lastName} email:${email}`
            );

            if (error) {
                logError(`${error.message}`);
                next(new Error(error.message));
            } else {
                try {
                    //finding a user if already prsent in the db
                    const findUser = await prisma.user
                        .findUnique({
                            where: {
                                email: email,
                            },
                        })
                        .then((user) => {
                            if (user == null) {
                                //creating a new user, generating salt and hash of password
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(
                                        password,
                                        salt,
                                        async (err, hash) => {
                                            if (err) throw err;

                                            await prisma.user
                                                .create({
                                                    data: {
                                                        firstName,
                                                        lastName,
                                                        email,
                                                        AuthenticationData: {
                                                            create: {
                                                                password: hash,
                                                            },
                                                        },
                                                    },
                                                })
                                                .then((user) => {
                                                    logInfo(
                                                        `${user.email} has been registered`
                                                    );
                                                    res.send({
                                                        message:
                                                            'User has been registered',
                                                    });
                                                    //res.redirect('./login');
                                                });
                                        }
                                    );
                                });
                            } else {
                                logError(`${user.email} already exist`);
                                next(new Error('Email already exist'));
                            }
                        })
                        .catch((err) => {
                            next(new Error('User not registered'));
                        });
                } catch (error) {
                    next(new Error(error.message));
                }
            }
        }
    );

    //Generating the JWT token for the logged in User
    authApi.post(
        '/login',
        async (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate('login', async (err, user, info) => {
                try {
                    if (err) {
                        logError('An error occurred while logging in the user');
                        return next(new Error('An error occurred'));
                    }

                    if (!user) {
                        logError(info.message);
                        return next(new Error('Invalid email/password'));
                    } else {
                        logInfo(`Login route begin for the user ${user.id}`);
                        logInfo(`Logged in successfully`);
                        req.login(user, { session: false }, (err) => {
                            if (err) {
                                res.send(err);
                            }

                            const accessToken = signAccessToken(
                                user.id,
                                keys.accessTokenKey
                            );

                            const refreshToken = signRefreshToken(
                                user.id,
                                keys.refreshTokenKey
                            );

                            logInfo(
                                `Login token generated for the user ${user.id}`
                            );
                            return res.json({ accessToken, refreshToken });
                        });
                    }
                } catch (error) {
                    return next(new Error(error.message));
                }
            })(req, res, next);
        }
    );

    app.use('/auth', authApi);
};
