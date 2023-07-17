import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
	PORT: z.number().default(3000),
	SECRET_KEY: z.string().nonempty(),
	DATABASE_URL: z.string().url().nonempty(),
	NODE_ENV: z.string().default('development'),
	XRPL_NODE_URL: z.string().url().nonempty(),
});

const configuration = configSchema.parse(process.env);

export default configuration;
