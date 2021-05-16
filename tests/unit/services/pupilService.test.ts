import { Pupil, User } from '@prisma/client';
import chai from 'chai';
import { addUser, deleteUser } from '../../../services/dataStore';
import {
    createPupilMatchRequest,
    deletePupilMatchRequest,
} from '../../../services/pupilMatchRequest';
import { userToPupil } from '../../../utils/helpers';
import { UserIsNotPupil, userIsPupil } from '../../serviceConfig';

const expect = require('chai').expect;
const chaiaspromised = require('chai-as-promised');
chai.use(chaiaspromised);

describe('Testing pupil service', function () {
    let user_notPupil: User,
        user_isPupil: User,
        offerRequests: any,
        pupil: Pupil;
    let pupilRequest: any;

    before(async function () {
        user_isPupil = await addUser(userIsPupil);
        user_notPupil = await addUser(UserIsNotPupil);
        pupil = await userToPupil(user_isPupil.id);
        offerRequests = [
            {
                matchOfferId: 'dhroiqeh4j3k24bk123',
                priority: 3,
            },
            {
                matchOfferId: 'dhroisae324bk1q3223',
                priority: 5,
            },
            {
                matchOfferId: 'dhroiqehsdasdsadb23',
                priority: 1,
            },
        ];
    });

    after(async function () {
        await deleteUser(user_notPupil.email);
        await deleteUser(user_isPupil.email);
    });

    it('Creating a pupil match Request when user is not pupil', async function () {
        pupilRequest = createPupilMatchRequest(offerRequests, user_notPupil.id);

        await expect(pupilRequest).to.eventually.be.rejectedWith(
            Error,
            'User must be a pupil to create a match request'
        );
    });

    it('Creating a pupil match Request when user is pupil', async function () {
        pupilRequest = await createPupilMatchRequest(
            offerRequests,
            user_isPupil.id
        );

        expect(pupilRequest).to.have.property('message');
        expect(pupilRequest.message).to.equal('Pupil match request created');
    });

    it('Delete a pupil match Request when user is not pupil', async function () {
        const del_course = deletePupilMatchRequest(
            pupilRequest.data.id,
            user_notPupil.id
        );

        await expect(del_course).to.eventually.be.rejectedWith(
            Error,
            'User must be a pupil to delete a match request'
        );
    });

    it('Delete a pupil match Request when user is pupil', async function () {
        const del_course = await deletePupilMatchRequest(
            pupilRequest.data.id,
            user_isPupil.id
        );

        expect(del_course).to.have.property('message');
        expect(del_course.message).to.equal('Pupil match request deleted');
    });
});
