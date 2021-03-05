import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PRIVATE_JWT_KEY } from '../utils/keys';
import {
    AuthSchema,
    email_schema,
    password_schema,
} from '../utils/authValidation';

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

            if (error) {
                next(new Error(error.message));
            } else {
                try {
                    //finding a alreadt exist email in the database
                    const findUser = await prisma.user
                        .findUnique({
                            where: {
                                email: value.email,
                            },
                        })
                        .then((user) => {
                            if (user == null) {
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(
                                        value.password,
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
                                next(new Error('Email already exist'));
                            }
                        })
                        .catch((err) => {
                            next(new Error(err.message));
                        });
                } catch (error) {
                    next(new Error(error.message));
                }
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
            4 - Make the token with previous password hash, so after user change password
                token will no longer be valid
            5 - Make the life of token not more than 10 minutes
            6 - create a link associated with the generated token  
            7 - Send the email to the email user has given 
            */
            const { email } = req.body;
            const { error, value } = email_schema.validate(email);

            if (error) {
                next(new Error(error.message));
            } else {
                await prisma.user
                    .findUnique({
                        where: {
                            email: value,
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
                    })
                    .then((user) => {
                        if (user == null) {
                            next(new Error('Email not registered'));
                        } else {
                            const payload = {
                                id: user.id,
                                email: user.email,
                            };

                            const secret =
                                user.AuthenticationData[0].password +
                                '--' +
                                PRIVATE_JWT_KEY;

                            const token = jwt.sign(payload, secret, {
                                expiresIn: '10m',
                                issuer: 'corona-school',
                            });

                            //Send email to the user
                            //SendTokenViaEmail(user.id,token,recipient): void
                        }
                    })
                    .catch((err) => {
                        next(new Error(err.message));
                    });
            }
        }
    );

    restApi.post(
        '/reset/:userId/:token',
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { userId, token } = req.params;
                const { password } = req.body;
                const { error, value } = password_schema.validate(password);

                if (error) {
                    next(new Error(error.message));
                } else {
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
                                            value,
                                            user.AuthenticationData[0].password
                                        ),
                                    };
                                } else if (token__ == '') {
                                    next(
                                        new Error('Invalid token/token expires')
                                    );
                                } else {
                                    next(new Error('Invalid token'));
                                }
                            } else {
                                next(new Error('User not found'));
                            }
                        })
                        .then(async (obj) => {
                            if (obj) {
                                if (!obj.isPasswordMatch) {
                                    await bcrypt.genSalt(10, (err, salt) => {
                                        return bcrypt.hash(
                                            value,
                                            salt,
                                            async (err, hash) => {
                                                if (err) throw err;

                                                await prisma.authenticationData
                                                    .update({
                                                        where: {
                                                            id:
                                                                obj.user
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
                            }
                        })
                        .catch((err) => {
                            next(new Error('Invalid token/token expires'));
                        });
                }
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
