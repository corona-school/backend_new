import passport from 'passport';
import passportLocal from 'passport-local';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import passportJwt from 'passport-jwt';
import { keys } from '../utils/secretKeys';

const prisma = new PrismaClient();
const localStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        AuthenticationData: {
                            select: {
                                password: true,
                            },
                        },
                    },
                });

                if (user === null) {
                    return done(null, false, {
                        message: 'User not found',
                    });
                } else {
                    bcrypt.compare(
                        password,
                        user.AuthenticationData[0].password,
                        (err, isMatch) => {
                            if (err) throw err;

                            if (isMatch) {
                                return done(null, user, {
                                    message: 'Logged in Successfully',
                                });
                            } else {
                                return done(null, false, {
                                    message: 'Password not matched',
                                });
                            }
                        }
                    );
                }
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: keys.accessTokenKey,
        },
        async (payload, done) => {
            try {
                return done(null, payload);
            } catch (error) {
                done(error);
            }
        }
    )
);
