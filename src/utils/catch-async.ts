/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Request, Response, NextFunction, RequestHandler } from 'express';

export interface CustomParamsDictionary {
	[key: string]: any;
}

export const catchAsync =
	(fn: RequestHandler<CustomParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>) =>
	(
		req: Request<CustomParamsDictionary, any, any, any, Record<string, any>>,
		res: Response<any, any>,
		next: NextFunction,
	) => {
		Promise.resolve(fn(req, res, next)).catch((err) => next(err));
	};
