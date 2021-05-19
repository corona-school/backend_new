import {
    addUser,
    findUser,
} from '../../../../dataStore/types/user';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { server } from '../../../../server';
import { invalidUserPhone, validUser } from '../../../userConfiguration';
import {deleteUser} from "../../../../dataStore/testingQueries";
import {getTextNotifications} from "../../../../dataStore/dataStore";

process.env.NODE_ENV = 'test';
chai.use(chaiHttp);

describe('Checks if the user route is available', function () {
    it('Checks if the user route is setup properly.', function (done) {
        chai.request(server)
            .get('/user/ping')
            .end((error, response) => {
                try {
                    chai.assert.equal(
                        response.status,
                        200,
                        'Response status was not 200.'
                    );
                    chai.assert.equal(
                        response.text,
                        'pong',
                        'Improper message sent'
                    );
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});

describe('Try changing Phone', function () {
    before(async function () {
        await addUser(validUser);
    });
    after(async function () {
        await deleteUser(validUser.email);
    });
    it('tries to change the phone number', function (done) {
        const loginDetail = {
            email: validUser.email,
            password: validUser.password,
        };
        chai.request(server)
            .post('/auth/login')
            .type('json')
            .send(loginDetail)
            .end(async (error, response) => {
                const accessToken = response.body.response.accessToken;
                chai.request(server)
                    .post('/user/change-phone')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ phone: invalidUserPhone.phone })
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(
                                response.body.response.message,
                                'Phone number has been updated',
                                'Improper message returned'
                            );
                            const updatedUsers = await findUser({
                                email: validUser.email,
                            });
                            chai.assert.equal(
                                updatedUsers.users[0].phone,
                                invalidUserPhone.phone,
                                'Phone number not updated?'
                            );
                            const updatedNotificationCount = await getTextNotifications(
                                invalidUserPhone.phone
                            );
                            chai.assert.equal(
                                updatedNotificationCount.length,
                                1,
                                'Text not sent?'
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});
