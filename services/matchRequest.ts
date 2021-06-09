import prisma from '../utils/prismaClient';

export const matchRequest = async (
    pupilMatchId: string,
    volunteerMatchId: string
) => {
    const matchRequest = await prisma.requestMatches.create({
        data: {
            pupilReq: {
                connect: {
                    id: pupilMatchId,
                },
            },
            volunteerReq: {
                connect: {
                    id: volunteerMatchId,
                },
            },
        },
    });

    return {
        data: matchRequest,
        message: 'Match Request created',
    };
};

export const deleteMatchRequest = async (matchRequestId: string) => {
    await prisma.requestMatches.delete({
        where: {
            id: matchRequestId,
        },
    });

    return {
        message: `${matchRequestId} match Request deleted`,
    };
};
