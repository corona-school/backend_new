import { Offer, Volunteer } from '@prisma/client';
import { getVolunteer } from '../utils/helpers';
import prisma from '../utils/prismaClient';
import { logError, logInfo } from './logger';
interface ICourseDates {
    startTime: Date;
    endTime: Date;
}
interface ICourse {
    title: string;
    category: string;
    tags: string[];
    target_group: string;
    times: ICourseDates[];
    description: string;
}

export const createCourse = async (courseData: ICourse, userId: string) => {
    logInfo('Verifying if user is a volunteer');
    const volunteer: Volunteer | null = await getVolunteer(userId);

    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a volunteer');
    }

    const createCourse = await prisma.offer.create({
        data: {
            title: courseData.title,
            category: courseData.category,
            tags: courseData.tags,
            target_group: courseData.target_group,
            times: JSON.stringify(courseData.times),
            description: courseData.description,
            volunteer: {
                connect: {
                    id: volunteer.id,
                },
            },
        },
    });

    return {
        data: createCourse,
        message: 'Course offer created',
    };
};

export const deleteCourse = async (offerId: string, userId: string) => {
    logInfo('Verifying if user is a volunteer');
    const volunteer: Volunteer | null = await getVolunteer(userId);

    if (volunteer == null) {
        logError('User must be a volunteer');
        throw new Error('User must be a Volunteer');
    }

    const deleteCourse = await prisma.offer.deleteMany({
        where: {
            AND: [
                {
                    id: {
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

    return {
        data: deleteCourse,
        message: 'Course offer deleted',
    };
};

export const getCourseData = async (offerId: string) => {
    logInfo(`Getting course data with offerID : ${offerId}`);

    const courseData: Offer | null = await prisma.offer.findUnique({
        where: {
            id: offerId,
        },
    });

    return courseData;
};
