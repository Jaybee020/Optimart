import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from './middlewares/morgan';

import { pingRouter } from './routes';

const application: Application = express();

application.use(morgan);
application.use(helmet());
application.use(express.json());
application.use(cors());

application.use('/api', pingRouter);

export default application;
