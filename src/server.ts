import { Server } from 'http';

import application from './app';
import configuration from './config/config';
import logger from './config/logger';
import prisma from './database/client';

let server: Server;
prisma.$connect().then(() => {
	logger.info('Connected to PostgreSQL database');

	server = application.listen(configuration.PORT, () => {
		logger.info(`Server is running on port ${configuration.PORT}`);
	});
});

const exitHandler = (): void => {
	if (server) {
		server.close(() => {
			logger.info('Server closed');
			process.exit(1);
		});
	} else {
		process.exit(1);
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unexpectedErrorHandler = (error: Error | any): void => {
	logger.error(error);
	exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
	logger.info('SIGTERM received. Closing server...');
	if (server) {
		server.close();
	}
});
