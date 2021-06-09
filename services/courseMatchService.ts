import prisma from '../utils/prismaClient';

export const createCourseMatch = async (
    pupilMatchId: string,
    volunteerMatchId: string
) => {
    const createMatch = await prisma.courseMatch.create({
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
        data: createMatch,
        message: 'Course match created',
    };
};

export const deleteCourseMatch = async (matchRequestId: string) => {
    const deleteMatch = await prisma.courseMatch.delete({
        where: {
            id: matchRequestId,
        },
    });

    return {
        data: deleteMatch,
        message: `Course match deleted`,
    };
};
