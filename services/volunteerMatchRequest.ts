import {
    CourseInstructorMatchRequest,
    CourseOffer,
    Prisma,
    Volunteer,
} from '@prisma/client';
import moment from 'moment';
import { getVolunteer } from '../utils/helpers';
import prisma from '../utils/prismaClient';
import { logError, logInfo } from './logger';

let valid_until_env: moment.Moment;
if (process.env.valid_until != undefined) {
    valid_until_env = moment(process.env.valid_until, 'YYYY-MM-DD hh:mm:ss');
} else {
    logError('(Valid_until) environment variable not defined');
}

export const createInstructorMatchRequest = async (
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

    const courseData: CourseOffer | null = await prisma.courseOffer.findUnique({
        where: {
            id: offerId,
        },
    });

    let MatchReq: Prisma.Prisma__CourseInstructorMatchRequestClient<CourseInstructorMatchRequest>[] = [],
        validUntil: number[] = [],
        transactionIds: string[] = [];

    if (courseData) {
        const courseTimes = JSON.parse(courseData.times);
        validUntil = [
            calculateValidTimestamps(valid_until_env, courseTimes[0]),
        ];

        const query = prisma.courseInstructorMatchRequest.create({
            data: {
                validUnitil: JSON.stringify(validUntil),
                offer: {
                    connect: {
                        id: offerId,
                    },
                },
            },
        });

        // above we are creating multiple queries and then executing in a batch
        for (let i = 0; i < NumberOfMatchReq; i++) {
            MatchReq = [...MatchReq, query];
        }

        const transaction = await prisma.$transaction(MatchReq);

        transaction.forEach((item) => {
            transactionIds = [...transactionIds, item.id];
        });

        return {
            data: transactionIds,
            message: `Offer match requests created`,
        };
    } else {
        logError('No course found');
        return {
            message: 'No course found',
        };
    }
};

export const deleteInstructorMatchRequest = async (
    matchRequestId: string,
    userId: string
) => {
    logInfo('Verifying if user is a volunteer');
    const volunteer: Volunteer | null = await getVolunteer(userId);

    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a volunteer to delete a match request');
    }

    const deleteInstructorMatch = await prisma.courseInstructorMatchRequest.delete(
        {
            where: {
                id: matchRequestId,
            },
        }
    );

    return {
        data: matchRequestId,
        message: 'Offer match request deleted',
    };
};

const calculateValidTimestamps = (
    valid_until: moment.Moment,
    courseDate: { startTime: string; endTime: string }
): number => {
    const milliseconds = valid_until.diff(moment(courseDate.startTime));

    const days = moment
        .duration(valid_until.diff(moment(courseDate.startTime)))
        .days();
    const hours = moment
        .duration(valid_until.diff(moment(courseDate.startTime)))
        .hours();
    const minutes = moment
        .duration(valid_until.diff(moment(courseDate.startTime)))
        .minutes();

    const remainingTime = `${days} days ${hours} hours & ${minutes} minutes`;

    return milliseconds;
};
