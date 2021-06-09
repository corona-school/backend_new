import { User, Volunteer } from '.prisma/client';
import chai from 'chai';
import { createCourse } from '../../../services/courseService';
import { addUser, deleteUser } from '../../../services/dataStore';
import {
    createOfferMatchRequest,
    deleteOfferMatchRequest,
} from '../../../services/volunteerMatchRequest';
import { userToVolunteer } from '../../../utils/helpers';
import {
    test_course,
    UserIsNotVolunteer,
    userIsVolunteer,
} from '../../serviceConfig';

const expect = require('chai').expect;
const chaiaspromised = require('chai-as-promised');
chai.use(chaiaspromised);

describe('Testing offer service', function () {
    let user_notVolunteer: User,
        user_isVolunteer: User,
        offer: any,
        volunteer: Volunteer;
    let offerRequest: any;

    before(async function () {
        user_isVolunteer = await addUser(userIsVolunteer);
        user_notVolunteer = await addUser(UserIsNotVolunteer);
        volunteer = await userToVolunteer(user_isVolunteer.id);
        offer = await createCourse(test_course, user_isVolunteer.id);
    });

    after(async function () {
        await deleteUser(user_notVolunteer.email);
        await deleteUser(user_isVolunteer.email, volunteer.id);
    });

    it('Creating an offer match Request when user is not volunteer', async function () {
        offerRequest = createOfferMatchRequest(
            offer.data.id,
            1,
            user_notVolunteer.id
        );

        await expect(offerRequest).to.eventually.be.rejectedWith(
            Error,
            'User must be a volunteer to create a match request'
        );
    });

    it('Creating an offer match Request when user is volunteer', async function () {
        offerRequest = await createOfferMatchRequest(
            offer.data.id,
            1,
            user_isVolunteer.id
        );

        expect(offerRequest).to.have.property('message');
        expect(offerRequest.message).to.equal('Offer match requests created');
    });

    it('Delete an offer match Request when user is not volunteer', async function () {
        const del_course = deleteOfferMatchRequest(
            offerRequest.data[0],
            user_notVolunteer.id
        );

        await expect(del_course).to.eventually.be.rejectedWith(
            Error,
            'User must be a volunteer to delete a match request'
        );
    });

    it('Delete an offer match Request when user is volunteer', async function () {
        const del_course = await deleteOfferMatchRequest(
            offerRequest.data[0],
            user_isVolunteer.id
        );

        expect(del_course).to.have.property('message');
        expect(del_course.message).to.equal('Offer match request deleted');
    });
});
