import { configure, getLogger, Logger } from 'log4js';

class loggerClass {
    getLogger(): Logger {
        if (process.env.NODE_ENV !== 'test') {
            return getLogger();
        } else {
            return getLogger('test');
        }
    }
}

const logger = new loggerClass().getLogger();
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

export const logDebug = (message: string): void => {
    logger.log('debug', message);
};
