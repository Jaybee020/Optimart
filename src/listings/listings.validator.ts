import Joi from 'joi';

const getById = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
};

const getAll = {
	query: Joi.object().keys({
		creator: Joi.string(),
		listedAfter: Joi.date(),
		listedBefore: Joi.date(),
		offset: Joi.number().integer().default(0),
		limit: Joi.number().integer().max(1000).default(1000),
		status: Joi.string().valid('ONGOING', 'CANCELLED', 'COMPLETED'),
	}),
};

const create = {
	body: Joi.object().keys({
		txHash: Joi.string().required(),
	}),
};

const cancel = {
	body: Joi.object().keys({
		txHash: Joi.string().required(),
		extraPayload: Joi.object({
			listingId: Joi.string().required(),
		}),
	}),
};

export default { getById, getAll, create, cancel };
