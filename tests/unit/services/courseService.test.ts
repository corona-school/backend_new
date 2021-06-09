import { User, Volunteer } from '@prisma/client';
import chai from 'chai';
import { createCourse, deleteCourse } from '../../../services/courseService';
import { addUser, deleteUser } from '../../../services/dataStore';
import { userToVolunteer } from '../../../utils/helpers';
import {
    userIsVolunteer,
    UserIsNotVolunteer,
    test_course,
} from '../../serviceConfig';

const expect = require('chai').expect;
const chaiaspromised = require('chai-as-promised');
chai.use(chaiaspromised);

describe('Testing course service', function () {
    let user_isVolunteer: User, user_notVolunteer: User, course: any;
    let volunteer: Volunteer;

    before(async function () {
        user_isVolunteer = await addUser(userIsVolunteer);
        user_notVolunteer = await addUser(UserIsNotVolunteer);
        volunteer = await userToVolunteer(user_isVolunteer.id);
    });

    after(async function () {
        await deleteUser(user_notVolunteer.email);
        await deleteUser(user_isVolunteer.email, volunteer.id);
    });

    it('Creating a course when user is not volunteer', async function () {
        course = createCourse(test_course, user_notVolunteer.id);

        await expect(course).to.eventually.be.rejectedWith(
            Error,
            'User must be a volunteer'
        );
    });

    it('Creating a course when user is volunteer', async function () {
        course = await createCourse(test_course, user_isVolunteer.id);

        expect(course).to.have.property('message');
        expect(course.message).to.equal('Course offer created');
    });

    it('Delete course data', async function () {
        const del_course = await deleteCourse(course.id, user_isVolunteer.id);

        expect(del_course).to.have.property('message');
        expect(del_course.message).to.equal('Course offer deleted');
    });
});
