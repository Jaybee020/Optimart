import { Router } from 'express';

import { getByCollectionId, getTokensInCollection, searchCollections } from '../controllers/collection';
import validate from '../middlewares/validate';
import catchAsync from '../utils/catch-async';
import collectionValidation from '../validators/collection';

const collectionRouter = Router();

collectionRouter.get(
	'/search',
	validate(collectionValidation.searchCollection),
	catchAsync(searchCollections),
);
collectionRouter.get(
	'/tokens/:id',
	validate(collectionValidation.getCollectionTokens),
	catchAsync(getTokensInCollection),
);
collectionRouter.get('/:id', validate(collectionValidation.getCollection), catchAsync(getByCollectionId));

export default collectionRouter;
