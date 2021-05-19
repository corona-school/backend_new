import { logInfo } from '../services/logger';
import { disconnectPrisma } from '../dataStore/testingQueries';

after(async () => {
    await disconnectPrisma();
    logInfo('Disconnected the database. Exitting Now');
    console.log('Disconnected the database. Exitting Now');
});
