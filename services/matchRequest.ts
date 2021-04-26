import { Offer, PrismaClient } from '@prisma/client';
import { isVolunteer } from '../utils/helpers';
import { logError } from './logger';

const prisma = new PrismaClient();

let VALID_UNTIL;
if (process.env.VALID_UNTIL === undefined) {
    logError('Valid until not configured properly');
} else {
    VALID_UNTIL = process.env.VALID_UNTIL;
}

export const createOfferMatchRequest = async (
    offerId: string,
    NumberOfMatchReq: number,
    userId: string
) => {
    const volunteer = await isVolunteer(userId);
    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a volunteer to create a match request');
    }

    const courseData: Offer | null = await prisma.offer.findUnique({
        where: {
            id: offerId,
        },
    });

    let MatchReq = [];
    if (courseData) {
        const query = prisma.volunteerMatchRequest.create({
            data: {
                parameters: courseData.time.toString(),
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

        for (let i = 0; i < NumberOfMatchReq; i++) {
            MatchReq.push(query);
        }

        await prisma.$transaction(MatchReq);
    }
};

export const removeOfferMatchRequest = async (
    matchRequestId: string,
    userId: string
) => {
    const volunteer = await isVolunteer(userId);
    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a volunteer to create a match request');
    }

    const deleteMatchRequest = await prisma.volunteerMatchRequest.delete({
        where: {
            id: matchRequestId,
        },
    });

    return {
        data: deleteMatchRequest,
        message: 'Match request removed',
    };
};
