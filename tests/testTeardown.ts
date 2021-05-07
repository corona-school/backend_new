import { disconnectPrisma } from '../services/dataStore';
import { logInfo } from '../services/logger';

after(async () => {
    await disconnectPrisma();
    logInfo('Disconnected the database. Exitting Now');
    console.log('Disconnected the database. Exitting Now');
});
