process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';

describe('Test if the routes are setup properly.', function () {
    it('Uses a default ping route to see if a valid response is received.', function (done) {
        chai.request(server)
            .get('/rest/ping')
            .end((error, response) => {
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
            });
    });
});
