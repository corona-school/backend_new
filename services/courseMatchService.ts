import prisma from '../utils/prismaClient';

export const createCourseMatch = async (
    pupilMatchId: string,
    volunteerMatchId: string
) => {
    const matchRequest = await prisma.courseMatch.create({
        data: {
            active: true,
            participantMatchRequest: {
                connect: {
                    id: pupilMatchId,
                },
            },
            instructorMatchRequest: {
                connect: {
                    id: volunteerMatchId,
                },
            },
        },
    });

    return {
        data: matchRequest,
        message: 'Course match created',
    };
};

export const deleteCourseMatch = async (matchRequestId: string) => {
    const deleteMatchRequest = await prisma.courseMatch.delete({
        where: {
            id: matchRequestId,
        },
    });

    return {
        data: deleteMatchRequest,
        message: `Course match deleted`,
    };
};
