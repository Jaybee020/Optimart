import application from './app';
import configuration from './config/config';
import logger from './config/logger';

const server = application.listen(configuration.PORT, () =>
	logger.info(`Server is running on port ${configuration.PORT}`),
);

const exitHandler = (): void => {
	server.close(() => {
		logger.info('Server closed');
		process.exit(1);
	});
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
