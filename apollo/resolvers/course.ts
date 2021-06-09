import {
    createCourse,
    deleteCourse,
    getCourseData,
} from '../../services/courseService';
import {
    deleteMatchRequest,
    matchRequest,
} from '../../services/courseMatchService';
import {
    createOfferMatchRequest,
    deleteOfferMatchRequest,
} from '../../services/volunteerMatchRequest';
import {
    createPupilMatchRequest,
    deletePupilMatchRequest,
} from '../../services/pupilMatchRequest';

export default {
    Query: {
        getCourse: async (parent: any, { id }: any, ctx: any) => {
            // if (!ctx.user) throw new Error('Authentication failed');

            console.log('-->', ctx);

            // const offer = await getCourseData(id);
            // if (offer) {
            //     offer.times = JSON.parse(offer.times);
            // }

            // return offer;
        },
    },

    Mutation: {
        createOffer: async (parent: any, { courseData, userId }: any) => {
            // const create_ = await createCourse(courseData, userId);
            // if (create_) {
            //     create_.data.times = JSON.parse(create_.data.times);
            // }
            // return create_;
        },

        deleteOffer: async (parent: any, { offerId, userId }: any) => {
            const delete_ = await deleteCourse(offerId, userId);
            return delete_;
        },

        createOfferMatch: async (
            parent: any,
            { offerId, NumberOfMatchReq, userId }: any
        ) => {
            const create_request = await createOfferMatchRequest(
                offerId,
                NumberOfMatchReq,
                userId
            );

            return create_request;
        },

        deleteOfferMatch: async (
            parent: any,
            { matchRequestId, userId }: any
        ) => {
            const delete_request = await deleteOfferMatchRequest(
                matchRequestId,
                userId
            );

            return delete_request;
        },

        createPupilMatch: async (parent: any, { offers, userId }: any) => {
            const create_request = await createPupilMatchRequest(
                offers,
                userId
            );

            return create_request;
        },

        deletePupilMatch: async (
            parent: any,
            { matchRequestId, userId }: any
        ) => {
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

        deleteMatch: async (parent: any, { matchId }: any) => {
            const delete_request = await deleteMatchRequest(matchId);

            return delete_request;
        },
    },
};
