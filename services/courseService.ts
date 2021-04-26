import { PrismaClient } from '@prisma/client';
import { isVolunteer } from '../utils/helpers';
import { logError, logInfo } from './logger';

const prisma = new PrismaClient();

interface ICourse {
    title: string;
    category: string;
    tags: string[];
    target_group: string;
    time: Date;
    description: string;
}

export const createCourse = async (courseData: ICourse, userId: string) => {
    logInfo('Verifying if user is Volunteer');
    const volunteer = await isVolunteer(userId);

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
            time: courseData.time,
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
        message: 'Course has been created',
    };
};

export const deactivateCourse = async (offerId: string, userId: string) => {
    logInfo('Verifying if user is Volunteer');
    const volunteer = await isVolunteer(userId);

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
        message: 'Course has been deleted',
    };
};

export const getCourseData = async (offerId: string) => {
    logInfo(`Getting course data with offerID : ${offerId}`);

    const courseData = await prisma.offer.findUnique({
        where: {
            id: offerId,
        },
    });

    if (courseData) {
        return courseData;
    } else {
        return {
            message: 'No course found',
        };
    }
};
