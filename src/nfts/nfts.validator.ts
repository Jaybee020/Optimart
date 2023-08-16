import Joi from 'joi';

const getById = {
	params: Joi.object().keys({
		id: Joi.string().required(),
	}),
};

export default { getById };
