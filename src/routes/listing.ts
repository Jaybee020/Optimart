import { Router } from 'express';

import { ListingController } from '../controllers';
import { validate, authenticateSignature } from '../middlewares';
import { catchAsync } from '../utils';
import listingValidation from '../validators/listing';

const listingRouter = Router();

listingRouter
	.get('/', validate(listingValidation.getAll), catchAsync(ListingController.getListings))
	.post(
		'/',
		authenticateSignature,
		validate(listingValidation.create),
		catchAsync(ListingController.createListing),
	);

listingRouter
	.get('/:id', validate(listingValidation.getById), catchAsync(ListingController.getListingById))
	.delete(
		'/:id',
		authenticateSignature,
		validate(listingValidation.cancel),
		catchAsync(ListingController.cancelListing),
	);

export default listingRouter;
