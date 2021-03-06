import { Pupil } from '@prisma/client';
import { getPupil } from '../utils/helpers';
import prisma from '../utils/prismaClient';
import { logError, logInfo } from './logger';

interface IOffers {
    matchOfferId: string;
    priority: number;
}

export const createPupilMatchRequest = async (
    offers: [IOffers],
    userId: string
) => {
    logInfo('Verifying if user is a pupil');
    const pupil: Pupil | null = await getPupil(userId);

    if (pupil == null) {
        logError('User must be a pupil');
        throw new Error('User must be a pupil to create a match request');
    }

    let courseOffers: any = [];
    for (let data of offers) {
        const findCourse = await prisma.courseInstructorMatchRequest.findUnique(
            {
                where: {
                    id: data.matchOfferId,
                },
            }
        );

        if (findCourse) {
            courseOffers.push({
                courseId: findCourse.offerId,
                priority: data.priority,
            });
        }
    }

    const createPupilMatch = await prisma.courseParticipantMatchRequest.create({
        data: {
            parameters: JSON.stringify(courseOffers),
            pupil: {
                connect: {
                    id: pupil.id,
                },
            },
        },
    });

    return {
        data: createPupilMatch,
        message: 'Pupil match created',
    };
};

export const deletePupilMatchRequest = async (
    matchRequestId: string,
    userId: string
) => {
    logInfo('Verifying if user is a pupil');
    const pupil: Pupil | null = await getPupil(userId);

    if (pupil == null) {
        logError('User must be a pupil');
        throw new Error('User must be a pupil to delete a match request');
    }

    const deletePupilMatch = await prisma.courseParticipantMatchRequest.delete({
        where: {
            id: matchRequestId,
        },
    });

    return {
        data: deletePupilMatch,
        message: 'Pupil match deleted',
    };
};
