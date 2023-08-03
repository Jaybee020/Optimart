import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './docs/swagger.json';
import { errorConverter, errorHandler } from './middlewares/error-handler';
import morgan from './middlewares/morgan';
import { pingRouter, collectionRouter, listingRouter, tokenRouter } from './routes';
import ApiError from './utils/api-error';

const application: Application = express();

application.use(morgan);
application.use(helmet());
application.use(express.json());
application.use(cors());

application.use('/api', pingRouter);
application.use('/api/tokens', tokenRouter);
application.use('/api/listings', listingRouter);
application.use('/api/collections', collectionRouter);

application.use('/docs', swaggerUi.serve);
application.use('/docs', swaggerUi.setup(swaggerDocument));

application.use((req, res, next) => {
	next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

application.use(errorConverter);
application.use(errorHandler);

export default application;
