import { Router } from 'express';

import { CollectionController } from '../controllers';
import { validate } from '../middlewares';
import { catchAsync } from '../utils';
import collectionValidation from '../validators/collection';

const collectionRouter = Router();

collectionRouter.get(
	'/search',
	validate(collectionValidation.searchCollection),
	catchAsync(CollectionController.searchCollections),
);
collectionRouter.get(
	'/tokens/:id',
	validate(collectionValidation.getCollectionTokens),
	catchAsync(CollectionController.getTokensInCollection),
);
collectionRouter.get(
	'/:id',
	validate(collectionValidation.getCollection),
	catchAsync(CollectionController.getByCollectionId),
);

export default collectionRouter;
