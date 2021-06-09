import {
    createCourse,
    deleteCourse,
    getCourseData,
} from '../../services/courseService';
import {
    deleteCourseMatch,
    createCourseMatch,
} from '../../services/courseMatchService';
import {
    createInstructorMatchRequest,
    deleteInstructorMatchRequest,
} from '../../services/volunteerMatchRequest';
import {
    createPupilMatchRequest,
    deletePupilMatchRequest,
} from '../../services/pupilMatchRequest';

export default {
    Query: {
        getCourse: async (parent: any, { id }: any, ctx: any) => {
            const offer = await getCourseData(id);
            return offer;
        },
    },

    Mutation: {
        createCourse: async (
            parent: any,
            { courseData, userId }: any,
            ctx: any
        ) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const create_ = await createCourse(courseData, userId);
            if (create_) {
                create_.data.times = JSON.parse(create_.data.times);
            }
            return create_;
        },

        deleteCourse: async (
            parent: any,
            { offerId, userId }: any,
            ctx: any
        ) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const delete_ = await deleteCourse(offerId, userId);
            return delete_;
        },

        createVolunteerMatch: async (
            parent: any,
            { offerId, NumberOfMatchReq, userId }: any,
            ctx: any
        ) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const create_request = await createInstructorMatchRequest(
                offerId,
                NumberOfMatchReq,
                userId
            );

            return create_request;
        },

        deleteVolunteerMatch: async (
            parent: any,
            { matchRequestId, userId }: any,
            ctx: any
        ) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const delete_request = await deleteInstructorMatchRequest(
                matchRequestId,
                userId
            );

            return delete_request;
        },

        createPupilMatch: async (
            parent: any,
            { offers, userId }: any,
            ctx: any
        ) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const create_request = await createPupilMatchRequest(
                offers,
                userId
            );

            return create_request;
        },

        deletePupilMatch: async (
            parent: any,
            { matchRequestId, userId }: any,
            ctx: any
        ) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const delete_request = await deletePupilMatchRequest(
                matchRequestId,
                userId
            );

            return delete_request;
        },

        createMatch: async (
            _: any,
            { pupilMatchId, volunteerMatchId }: any,
            ctx: any
        ) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const delete_request = await createCourseMatch(
                pupilMatchId,
                volunteerMatchId
            );

            return delete_request;
        },

        deleteMatch: async (parent: any, { matchId }: any, ctx: any) => {
            if (!ctx.isAuth) {
                throw new Error(ctx.message);
            }

            const delete_request = await deleteCourseMatch(matchId);

            return delete_request;
        },
    },
};
