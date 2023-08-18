import Joi from 'joi';

const searchCollection = {
	query: Joi.object().keys({
		q: Joi.string().required(),
		limit: Joi.number().default(5).integer(),
	}),
};

const getCollection = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
};

const getCollectionTokens = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
	query: Joi.object().keys({
		offset: Joi.number().integer().default(0),
		limit: Joi.number().integer().max(1000).default(1000),
	}),
};

export default { searchCollection, getCollection, getCollectionTokens };
