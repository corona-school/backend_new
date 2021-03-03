import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PRIVATE_JWT_KEY } from '../utils/keys';
import { AuthSchema } from '../utils/AuthValidation';
import Joi from 'joi';

const prisma = new PrismaClient();

export const ConfigureREST = (app: express.Application): void => {
    const restApi = express.Router();
    restApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    //Registering a user into the database
    restApi.post(
        '/register',
        async (req: Request, res: Response, next: NextFunction) => {
            const { firstName, lastName, email } = req.body;

            //validating the auth request
            const { error, value } = AuthSchema.validate(req.body);

            if (error) next(new Error(error?.message));

            try {
                //finding a alreadt exist email in the database
                const findUser = await prisma.user.findUnique({
                    where: {
                        email: value.email,
                    },
                });

                if (findUser == null) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(value.password, salt, async (err, hash) => {
                            if (err) throw err;
                            const user = await prisma.user
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
                                    res.send({
                                        message: 'User has been registered',
                                    });
                                    //res.redirect('./login');
                                });
                        });
                    });
                } else {
                    next(new Error('Email already exist'));
                }
            } catch (error) {
                next(new Error(error.message));
            }
        }
    );

    //Generating the JWT token for the logged in User
    restApi.post(
        '/login',
        async (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate('login', async (err, user, info) => {
                try {
                    if (err || !user) {
                        return next(new Error('An error occurred'));
                    }

                    req.login(user, { session: false }, (err) => {
                        if (err) {
                            res.send(err);
                        }

                        const payload = { _id: user._id, email: user.email };
                        const token = jwt.sign(
                            { user: payload },
                            PRIVATE_JWT_KEY
                        );
                        return res.json({ token });
                    });
                } catch (error) {
                    return next(new Error(error.message));
                }
            })(req, res, next);
        }
    );

    restApi.post(
        '/forgot',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response, next: NextFunction) => {
            /*
            1 - Get email of the user
            2 - Create a token
            3 - Find the user with email in the DB
            4 - Save the user id:token in the token table to later verify it
            5 - Make the life of token not more than 5 minutes
            6 - create a link associated with the generated token  
            7 - Send the email to the email user has given 
            */

            const { email } = req.body;

            const getUser = await prisma.user.findUnique({
                where: {
                    email: email,
                },
                select: {
                    id: true,
                    email: true,
                    AuthenticationData: {
                        select: {
                            password: true,
                        },
                    },
                },
            });

            if (!getUser) next(new Error('User not found'));

            const payload = {
                id: getUser?.id,
                email: getUser?.email,
            };

            const secret =
                getUser?.AuthenticationData[0].password +
                '--' +
                PRIVATE_JWT_KEY;

            jwt.sign(payload, secret);
        }
    );

    restApi.post(
        '/reset/:userId/:token',
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { userId, token } = req.params;
                const { password } = req.body;

                await prisma.user
                    .findUnique({
                        where: {
                            id: userId,
                        },
                        include: {
                            AuthenticationData: {
                                select: {
                                    id: true,
                                    password: true,
                                },
                            },
                        },
                    })
                    .then((user) => {
                        if (user != null) {
                            const secret =
                                user.AuthenticationData[0].password +
                                '--' +
                                PRIVATE_JWT_KEY;
                            const token__ = jwt.verify(token, secret);

                            if (token__) {
                                return {
                                    user,
                                    isPasswordMatch: bcrypt.compareSync(
                                        password,
                                        user.AuthenticationData[0].password
                                    ),
                                };
                            } else if (token__ == '') {
                                next(new Error('Invalid token/token expires'));
                            } else {
                                next(new Error('Invalid token'));
                            }
                        } else {
                            next(new Error('User not found'));
                        }
                    })
                    .then(async (obj) => {
                        if (!obj?.isPasswordMatch) {
                            await bcrypt.genSalt(10, (err, salt) => {
                                return bcrypt.hash(
                                    password,
                                    salt,
                                    async (err, hash) => {
                                        if (err) throw err;

                                        await prisma.authenticationData
                                            .update({
                                                where: {
                                                    id:
                                                        obj?.user
                                                            .AuthenticationData[0]
                                                            .id,
                                                },
                                                data: {
                                                    password: hash,
                                                },
                                            })
                                            .then((done) =>
                                                res.json({
                                                    msg:
                                                        'User password has been updated',
                                                })
                                            );
                                    }
                                );
                            });
                        } else {
                            next(
                                new Error(
                                    'New password cannot be an old password'
                                )
                            );
                        }
                    })
                    .catch((err) => {
                        next(new Error('Invalid token/token expires'));
                    });
            } catch (error) {
                next(new Error(error.message));
            }
        }
    );

    //Testing route
    restApi.get(
        '/user',
        passport.authenticate('jwt', { session: false }),
        (req, res) => {
            res.json({
                msg: 'Hello world',
            });
        }
    );

    app.use('/rest', restApi);
};
