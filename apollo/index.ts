import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import { verify } from 'jsonwebtoken';
import { keys } from '../utils/secretKeys';

export const ConfigureApollo = (app: express.Application): void => {
    const apollo = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const authHeader = req.headers.authorization || '';

            let token;
            authHeader
                ? authHeader.split(' ')[0] == 'Bearer'
                    ? (token = authHeader.split(' ')[1])
                    : ''
                : null;

            if (token) {
                return verify(
                    token,
                    keys.accessTokenKey,
                    async (err: any, decoded: any) => {
                        if (err != null) {
                            if (err.name === 'TokenExpiredError') {
                                return {
                                    message: 'Auth failed - TokenExpired',
                                    isAuth: false,
                                };
                            }

                            if (err.name === 'JsonWebTokenError') {
                                return {
                                    message: 'Auth failed -TokenError',
                                    isAuth: false,
                                };
                            }
                        }

                        return {
                            message: 'Access granted',
                            isAuth: true,
                        };
                    }
                );
            }
        },
    });

    apollo.applyMiddleware({ app, path: '/apollo' });
};
