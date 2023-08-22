import Joi from 'joi';

const searchUser = {
	query: Joi.object().keys({
		q: Joi.string().required(),
		limit: Joi.number().default(5).integer(),
	}),
};

const getUser = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
};
