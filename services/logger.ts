import { configure, getLogger } from 'log4js';
const logger = getLogger();
export const ConfigureLogger = (): void => {
    try {
        configure('./configuration/log.json');
        console.info('Logger Configured');
    } catch (e) {
        console.warn('Logger could not be setup properly. ' + e);
    }
};

export const logInfo = (message: string): void => {
    logger.log('info', message);
};

export const logError = (message: string): void => {
    logger.log('error', message);
};
