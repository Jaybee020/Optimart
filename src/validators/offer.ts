import Joi from 'joi';

const getById = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
};

const getAll = {
	query: Joi.object().keys({
		offeree: Joi.string(),
		offeror: Joi.string(),
		listing: Joi.string(),
		nftId: Joi.string(),
		offeredAfter: Joi.date(),
		offeredBefore: Joi.date(),
		offset: Joi.number().integer().default(0),
		limit: Joi.number().integer().max(1000).default(1000),
		status: Joi.string().valid('PENDING', 'CANCELLED', 'ACCEPTED', 'REJECTED'),
	}),
};

const create = {
	body: Joi.object().keys({
		txHash: Joi.string().required(),
		extraPayload: Joi.object({
			listingId: Joi.string(),
		}),
	}),
};

const cancel = {
	body: Joi.object().keys({
		txHash: Joi.string().required(),
		extraPayload: Joi.object({
			offerId: Joi.string().required(),
		}),
	}),
};

const reject = {
	body: Joi.object().keys({
		txHash: Joi.string().required(),
		extraPayload: Joi.object({
			offerId: Joi.string().required(),
		}),
	}),
};

const accept = {
	body: Joi.object().keys({
		txHash: Joi.string().required(),
		extraPayload: Joi.object({
			offerId: Joi.string().required(),
		}),
	}),
};

export default { getById, getAll, create, cancel, reject, accept };
