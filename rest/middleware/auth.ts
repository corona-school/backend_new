import passport from 'passport';
import passportLocal from 'passport-local';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PRIVATE_JWT_KEY } from '../../utils/keys';
import passportJwt from 'passport-jwt';

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
                const findUser = await prisma.user
                    .findUnique({
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
                    })
                    .then(async (user) => {
                        if (user == null) {
                            return done(null, false, {
                                message: 'User not found',
                            });
                        } else {
                            await bcrypt.compare(
                                password,
                                user.AuthenticationData[0].password,
                                (err, isMatch) => {
                                    if (isMatch) {
                                        return done(null, user.id, {
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
                    });
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
            secretOrKey: PRIVATE_JWT_KEY,
        },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (error) {
                done(error);
            }
        }
    )
);
