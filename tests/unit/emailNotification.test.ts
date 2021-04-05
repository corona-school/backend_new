import { assert } from 'chai';
import { test_notification } from '../../mailTemplates/test_notification';
import { getPendingEmailNotificationIds } from '../../services/dataStore';
import { runNotificationHandlerOnce } from '../../services/notificationHandler';

describe('Test deferring email notifications', function () {
    it('Sends a deferred notification for template ID: 2672994', async function () {
        const notification = new test_notification(
            '"Corona School Team" <backend@corona-school.de>',
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

    it('Sends a forced notification for template ID: 2672994', async function () {
        const notification = new test_notification(
            '"Corona School Team" <backend@corona-school.de>',
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