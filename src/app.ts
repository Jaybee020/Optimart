import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './docs/swagger.json';
import morgan from './middlewares/morgan';
import { pingRouter } from './routes';

const application: Application = express();

application.use(morgan);
application.use(helmet());
application.use(express.json());
application.use(cors());

application.use('/api', pingRouter);
application.use('/docs', swaggerUi.serve);
application.use('/docs', swaggerUi.setup(swaggerDocument));

export default application;
