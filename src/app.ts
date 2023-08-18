import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';
import swaggerUi from 'swagger-ui-express';

import collectionRouter from './collections/collections.router';
import swaggerDocument from './docs/swagger.json';
import listingRouter from './listings/listings.router';
import { morgan, errorHandler, errorConverter } from './middlewares';
import tokenRouter from './nfts/nfts.router';
import pingRouter from './ping/ping.router';
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
