import { gql } from 'apollo-server-express';

export default gql`
    
    type Course {
        title: String
        category: String
        tags: [String]
        target_group: String
        times: String
        description: String
    }

    # Input types for the data-models ( mainley for mutations )
    input UserInput {
        firstName: String
        lastName: String
        email: String
        emailVerified: Boolean
        phone: String
        phoneVerified: Boolean
        active: Boolean
    }

    input ICourseDatesInput {
        startTime: String
        endTime: String
    }

    input CourseInput {
        title: String
        category: String
        tags: [String]
        target_group: String
        times: [ICourseDatesInput]
        description: String
    }

    input PupilOffer {
        matchOfferId: String
        priority: Int
    }

    # Return type for mutations
    type OfferReturnType {
        data: Course
        message: String
    }

    type deleteCount {
        count: Int
    }

    type deleteReturnType {
        data: deleteCount
        message: String
    }

    type CreateOfferRequestReturnType {
        data: [String]
        message: String
    }

    type deleteOfferRequestReturnType {
        data: String
        message: String
    }

    type Pupil {
        requestor: String
        parameters: String
    }

    type PupilReturnType {
        data: Pupil
        message: String
    }

    type MatchRequestDataObject {
        id: String
        pupilReqId: String
        volunteerReqId: String
    }

    type RequestMatchReturnType {
        data: MatchRequestDataObject
        message: String
    }

    # Query types for the data-models
    extend type Query {
        getCourse(id: ID!): Course
    }

    # Mutration types for data manipulation
    extend type Mutation {
        createOffer(courseData: CourseInput, userId: String): OfferReturnType

        deleteOffer(offerId: String, userId: String): deleteReturnType

        createOfferMatch(
            offerId: String
            NumberOfMatchReq: Int
            userId: String
        ): CreateOfferRequestReturnType

        deleteOfferMatch(
            matchRequestId: String
            userId: String
        ): deleteOfferRequestReturnType

        createPupilMatch(offers: [PupilOffer], userId: String): PupilReturnType

        deletePupilMatch(
            matchRequestId: String
            userId: String
        ): PupilReturnType

        createMatch(
            pupilMatchId: String
            volunteerMatchId: String
        ): RequestMatchReturnType

        deleteMatch(matchId: String): RequestMatchReturnType
    }
`;
