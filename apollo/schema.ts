import { gql } from 'apollo-server-express';
import { Prisma } from '@prisma/client';

const typeDefs = gql`
    type ICourseDates {
        startTime: String
        endTime: String
    }

    type course {
        title: String
        category: String
        tags: [String]
        target_group: String
        times: [ICourseDates]
        description: String
    }

    # input ICourseDatesInput {
    #     startTime: String
    #     endTime: String
    # }

    # input courseInput {
    #     title: String
    #     category: String
    #     tags: [String]
    #     target_group: String
    #     times: [ICourseDatesInput]
    #     description: String
    # }

    # type returnType {
    #     data: Offer
    #     message: String
    # }

    type Query {
        ping: String
        getCourse(id: ID!): course
    }

    # type Mutation {
    #     createOffer(courseData: courseInput, userId: String): returnType
    #     #deleteOffer(offerId: String, userId: String): returnType
    # }
`;

export default typeDefs;
