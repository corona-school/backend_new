import { CourseOffer, Volunteer } from '@prisma/client';
import { getVolunteer } from '../utils/helpers';
import prisma from '../utils/prismaClient';
import { logError, logInfo } from './logger';
interface ICourse {
    title: string;
    description: string;
    category: string;
    tags: string[];
    imageKey?: string;
    times: string;
    participantContactEmail?: string;
    targetGroup: string;
}

export const createCourse = async (courseData: ICourse, userId: string) => {
    logInfo('Verifying if user is a volunteer');
    const volunteer: Volunteer | null = await getVolunteer(userId);

    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a volunteer');
    }

    if (courseData) {
        const createCourse = await prisma.courseOffer.create({
            data: {
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                tags: courseData.tags,
                imageKey: courseData.imageKey,
                times: JSON.stringify(courseData.times),
                participantContactEmail: courseData.participantContactEmail,
                targetGroup: courseData.targetGroup,
                volunteers: {
                    create: {
                        volunteerId: volunteer.id,
                    },
                },
            },
        });

        return {
            data: createCourse,
            message: 'Course offer created',
        };
    }
};

export const deleteCourse = async (offerId: string, userId: string) => {
    logInfo('Verifying if user is a volunteer');
    const volunteer: Volunteer | null = await getVolunteer(userId);

    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a Volunteer');
    }

    const deleteVolunteersOnCourses = prisma.volunteersOnCourses.deleteMany({
        where: {
            AND: [
                {
                    courseOfferId: {
                        equals: offerId,
                    },
                },
                {
                    volunteerId: {
                        equals: volunteer.id,
                    },
                },
            ],
        },
    });

    const deleteCourseData = prisma.courseOffer.delete({
        where: {
            id: offerId,
        },
    });

    const transation = await prisma.$transaction([
        deleteVolunteersOnCourses,
        deleteCourseData,
    ]);

    return {
        data: deleteCourse,
        message: 'Course offer deleted',
    };
};

export const getCourseData = async (offerId: string) => {
    logInfo(`Getting course data with offerID : ${offerId}`);

    const courseData: CourseOffer | null = await prisma.courseOffer.findUnique({
        where: {
            id: offerId,
        },
    });

    return courseData;
};