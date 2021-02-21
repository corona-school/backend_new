const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Query {
        ping: String
    }
`;

export default typeDefs;