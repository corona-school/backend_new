import passport from 'passport';
import passportJwt from 'passport-jwt';
import { keys } from '../utils/secretKeys';

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

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
