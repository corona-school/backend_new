import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { PRIVATE_JWT_KEY } from '../utils/keys';
const prisma = new PrismaClient();

export const ConfigureREST = (app: express.Application): void => {
    const restApi = express.Router();
    restApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    //Registering a User into DB
    restApi.post(
        '/register',
        async (req: Request, res: Response, next: NextFunction) => {
            const { firstName, lastName, email, password } = req.body;

            if (!email || !password) next(new Error('Fields cannot be empty'));

            if (password.length < 8)
                next(new Error('Password must be at least 6 characters'));

            try {
                const findUser = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                if (findUser == null) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, async (err, hash) => {
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
            } catch (error) {}
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
                    console.log(req.user);
                    req.login(user, { session: false }, (err) => {
                        if (err) {
                            res.send(err);
                        }

                        const payload = { _id: user._id, email: user.email };
                        const token = jwt.sign(
                            { user: payload },
                            PRIVATE_JWT_KEY,
                            { expiresIn: '3 days' }
                        );
                        return res.json({ user, token });
                    });
                } catch (error) {
                    return next(error);
                }
            })(req, res, next);
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
