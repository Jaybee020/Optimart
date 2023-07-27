import 'dotenv/config';
import Joi from 'joi';

const configSchema = Joi.object({
	PORT: Joi.number().default(3000),
	SECRET_KEY: Joi.string().required(),
	DATABASE_URL: Joi.string().uri({ scheme: 'postgresql' }).required(),
	NODE_ENV: Joi.string().default('development'),
	XRPL_NODE_URL: Joi.string().uri({ scheme: 'wss' }).required(),
	XRPL_ACCOUNT_SECRET: Joi.string().required(),
});

const { value, error } = configSchema.validate(process.env);
if (error) throw error;

export default value;
