import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import typeDefs from './schema';
import resolvers from './resolvers';

export const ConfigureApollo = (app: express.Application): void => {
    const apollo = new ApolloServer({ typeDefs, resolvers });

    apollo.applyMiddleware({ app, path: '/apollo' });
};
