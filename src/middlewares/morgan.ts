import morgan, { StreamOptions } from 'morgan';

import { logger } from '../config';

const stream: StreamOptions = {
	write: (message) => logger.debug(message),
};

const skip = (): boolean => {
	const env = process.env.NODE_ENV || 'development';
	return env !== 'development';
};

const middleware = morgan(':method :url :status :res[content-length] - :response-time ms', {
	stream,
	skip,
});

export default middleware;