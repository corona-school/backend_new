import { Offer } from '.prisma/client';
import { createCourse, getCourseData } from '../services/courseService';

const resolvers = {
    Query: {
        ping(): string {
            return 'pong';
        },

        async getCourse(_: any, args: Offer) {
            const offer = await getCourseData(args.id);
            return offer;
        },
    },

    // Mutation: {
    //     async createOffer(_: any, args: any) {
    //         console.log(args);
    //         //const create_ = await createCourse(args)
    //     },
    // },
};

export default resolvers;
