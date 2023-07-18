import winston from 'winston';

import configuration from './config';

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

const level = (): string => {
	const isDevelopment = configuration.NODE_ENV === 'development';
	return isDevelopment ? 'debug' : 'info';
};

const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
	winston.format.colorize({ all: true }),
	winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const transports = [new winston.transports.Console()];

const logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports,
});

export default logger;
