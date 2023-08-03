import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';

import ApiError from '../utils/api-error';
import pick from '../utils/pick';

interface ValidatorSchema {
	body?: Joi.SchemaLike;
	query?: Joi.SchemaLike;
	params?: Joi.SchemaLike;
}

export default function validate(schema: ValidatorSchema) {
	return function (req: Request, res: Response, next: NextFunction): void {
		const validSchema = pick(schema, ['params', 'query', 'body']);
		const payload = pick(req, Object.keys(validSchema));

		const { value, error } = Joi.compile(validSchema)
			.prefs({ errors: { label: 'key' } })
			.validate(payload);

		if (error) {
			const msg = error.details.map((details) => details.message).join(', ');
			return next(new ApiError(httpStatus.BAD_REQUEST, msg));
		}

		Object.assign(req, value);
		return next();
	};
}
