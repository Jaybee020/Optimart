import { Router } from 'express';

import CollectionController from './collections.controller';
import CollectionValidation from './collections.validator';
import { validate } from '../middlewares';
import { catchAsync } from '../utils';

const collectionRouter = Router();

collectionRouter.get(
	'/search',
	validate(CollectionValidation.searchCollection),
	catchAsync(CollectionController.searchCollections),
);
collectionRouter.get(
	'/tokens/:id',
	validate(CollectionValidation.getCollectionTokens),
	catchAsync(CollectionController.getTokensInCollection),
);
collectionRouter.get(
	'/:id',
	validate(CollectionValidation.getCollection),
	catchAsync(CollectionController.getByCollectionId),
);

export default collectionRouter;
