import { Offer, PrismaClient } from '@prisma/client';
import { isPupil } from '../utils/helpers';
import { logError } from './logger';

const prisma = new PrismaClient();

export const createPupilMatchRequest = async (
    offerId: string,
    userId: string
) => {
    const pupil = await isPupil(userId);
    if (pupil == null) {
        logError('User must be a pupil');
        throw new Error('User must be a pupil to create a match request');
    }

    const courseData: Offer | null = await prisma.offer.findUnique({
        where: {
            id: offerId,
        },
    });

    if (courseData) {
        const createReqest = await prisma.pupilMatchRequest.create({
            data: {
                parameters: ['1', '12'],
                user: {
                    connect: {
                        id: pupil.id,
                    },
                },
            },
        });

        return {
            data: createReqest,
            message: 'Match request created',
        };
    }
};

export const removeOfferMatchRequest = async (
    matchRequestId: string,
    userId: string
) => {
    const pupil = await isPupil(userId);
    if (pupil == null) {
        logError('User must be a pupil');
        throw new Error('User must be a pupil to create a match request');
    }

    const removeMatchRequest = await prisma.pupilMatchRequest.delete({
        where: {
            id: matchRequestId,
        },
    });

    return {
        data: removeMatchRequest,
        message: 'Match request removed',
    };
};
