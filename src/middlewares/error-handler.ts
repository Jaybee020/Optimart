import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

import configuration from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/api-error';

export async function errorConverter(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	let error = err;
	if (!(error instanceof ApiError)) {
		let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code == 'P2025') {
			statusCode = httpStatus.NOT_FOUND;
		}

		const message = error.message || httpStatus[statusCode];
		error = new ApiError(statusCode, message, false, err.stack);
	}
	next(error);
}

export async function errorHandler(
	err: ApiError,
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	logger.error('An error occured: ', err, err.stack);

	let { statusCode, message } = err;
	if (configuration.NODE_ENV === 'production' && !err.isOperational) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
	}

	res.status(statusCode).json({ error: message });
	next();
}
