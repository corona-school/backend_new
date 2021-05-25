import { Offer } from '.prisma/client';
import { IResolvers } from 'graphql-tools';
import {
    createCourse,
    deleteCourse,
    getCourseData,
} from '../services/courseService';
import { deleteMatchRequest, matchRequest } from '../services/matchRequest';
import {
    createOfferMatchRequest,
    deleteOfferMatchRequest,
} from '../services/offerMatchRequest';
import {
    createPupilMatchRequest,
    deletePupilMatchRequest,
} from '../services/pupilMatchRequest';
import { userRegister } from '../services/userService';

const resolvers: IResolvers = {
    Query: {
        getCourse: async (_: any, { id }: Offer) => {
            const offer = await getCourseData(id);
            if (offer) {
                offer.times = JSON.parse(offer.times);
            }

            return offer;
        },
    },

    Mutation: {
        createOffer: async (_: any, { courseData, userId }: any) => {
            const create_ = await createCourse(courseData, userId);
            if (create_) {
                create_.data.times = JSON.parse(create_.data.times);
            }

            return create_;
        },

        deleteOffer: async (_: any, { offerId, userId }: any) => {
            const delete_ = await deleteCourse(offerId, userId);
            return delete_;
        },

        userRegister: async (_: any, { userData }: any) => {
            const newUser = await userRegister(userData);
            return newUser;
        },

        createOfferMatch: async (
            _: any,
            { offerId, NumberOfMatchReq, userId }: any
        ) => {
            const create_request = await createOfferMatchRequest(
                offerId,
                NumberOfMatchReq,
                userId
            );

            return create_request;
        },

        deleteOfferMatch: async (_: any, { matchRequestId, userId }: any) => {
            const delete_request = await deleteOfferMatchRequest(
                matchRequestId,
                userId
            );

            return delete_request;
        },

        createPupilMatch: async (_: any, { offers, userId }: any) => {
            const create_request = await createPupilMatchRequest(
                offers,
                userId
            );

            return create_request;
        },

        deletePupilMatch: async (_: any, { matchRequestId, userId }: any) => {
            const delete_request = await deletePupilMatchRequest(
                matchRequestId,
                userId
            );

            return delete_request;
        },

        createMatch: async (
            _: any,
            { pupilMatchId, volunteerMatchId }: any
        ) => {
            const delete_request = await matchRequest(
                pupilMatchId,
                volunteerMatchId
            );

            return delete_request;
        },

        deleteMatch: async (_: any, { matchId }: any) => {
            const delete_request = await deleteMatchRequest(matchId);

            return delete_request;
        },
    },
};

export default resolvers;
