import { assert } from 'chai';
import { test_notification } from '../../../mailjet/mailTemplates/test_notification';
import { getPendingEmailNotificationIds } from '../../../services/dataStore';

describe('Test deferring email notifications', function () {
    it('Sends a deferred notification for template ID: 2672994', async function () {
        const notification = new test_notification(
            'ayush.pandey@corona-school.de',
            { subject: 'Test Send Message', cust_name: 'Ayush' }
        );
        return notification.defer().then(async (result) => {
            assert.deepEqual(
                result.status,
                200,

                'Adding notification to deferred list failed'
            );
            const notificationId = result.res;
            const pendingNotifications = await getPendingEmailNotificationIds();
            const ids = pendingNotifications.map((obj) => obj.id);
            assert.include(
                ids,
                notificationId,
                'Notification was not added to the database'
            );
        });
    });
});

describe('Test sending a forced email notification', function () {
    it('Sends a forced notification for template ID: 2672994', async function () {
        const notification = new test_notification(
            'ayush.pandey@corona-school.de',
            { subject: 'Test Send Message', cust_name: 'Ayush' }
        );
        return notification.forced_send().then(async (result) => {
            assert.deepEqual(
                result.status,
                200,
                'Adding notification to deferred list failed'
            );
            const notificationId = result.res;
            const pendingNotifications = await getPendingEmailNotificationIds();
            const ids = pendingNotifications.map((obj) => obj.id);
            assert.notInclude(
                ids,
                notificationId,
                'Notification was not added to the database'
            );
        });
    });
});
