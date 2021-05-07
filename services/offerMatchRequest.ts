import { Offer, Volunteer } from '@prisma/client';
import moment from 'moment';
import { getVolunteer } from '../utils/helpers';
import prisma from '../utils/prismaClient';
import { logError, logInfo } from './logger';

let valid_until: moment.Moment;
if (process.env.valid_until != undefined) {
    valid_until = moment(process.env.valid_until, 'YYYY-MM-DD hh:mm:ss');
} else {
    logError('(Valid_until) environment variable not defined');
}

export const createOfferMatchRequest = async (
    offerId: string,
    NumberOfMatchReq: number,
    userId: string
) => {
    logInfo('Verifying if user is a volunteer');
    const volunteer: Volunteer | null = await getVolunteer(userId);

    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a volunteer to create a match request');
    }

    const courseData: Offer | null = await prisma.offer.findUnique({
        where: {
            id: offerId,
        },
    });

    let MatchReq: any[] = [],
        validDates: any[] = [];

    if (courseData) {
        courseData.times.forEach((courseTime) => {
            validDates.push(calculateValidTimestamps(valid_until, courseTime));
        });

        const query = prisma.volunteerMatchRequest.create({
            data: {
                parameters: [
                    `valid_until: ${validDates}`,
                    `target_group: ${courseData.target_group}`,
                ],
                user: {
                    connect: {
                        id: volunteer.id,
                    },
                },
                offer: {
                    connect: {
                        id: offerId,
                    },
                },
            },
        });

        // above we are creating multiple queries and then executing in a batch
        for (let i = 0; i < NumberOfMatchReq; i++) {
            MatchReq.push(query);
        }

        await prisma.$transaction(MatchReq);

        return {
            message: `Offer match request created`,
        };
    } else {
        logError('No offers for the given ID');
        return {
            message: 'No offers found',
        };
    }
};

export const deleteOfferMatchRequest = async (
    matchRequestId: string,
    userId: string
) => {
    logInfo('Verifying if user is a volunteer');
    const volunteer: Volunteer | null = await getVolunteer(userId);

    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a volunteer to create a match request');
    }

    const deleteMatch = await prisma.volunteerMatchRequest.delete({
        where: {
            id: matchRequestId,
        },
    });

    return {
        data: matchRequestId,
        message: 'Offer match request deleted',
    };
};

const calculateValidTimestamps = (
    valid_until: moment.Moment,
    courseDate: string
): number => {
    const milliseconds = valid_until.diff(moment(courseDate));

    return milliseconds;
};
