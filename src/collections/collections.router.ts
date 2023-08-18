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
	'/trending',
	validate(CollectionValidation.searchCollection),
	catchAsync(CollectionController.getTrendingCollections),
);
collectionRouter.get(
	'/top',
	validate(CollectionValidation.searchCollection),
	catchAsync(CollectionController.getTopCollections),
);
collectionRouter.get(
	'/nfts/:id',
	validate(CollectionValidation.getCollectionTokens),
	catchAsync(CollectionController.getNFTsInCollection),
);
collectionRouter.get(
	'/:id',
	validate(CollectionValidation.getCollection),
	catchAsync(CollectionController.getCollectionById),
);

export default collectionRouter;
