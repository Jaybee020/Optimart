import { Router } from 'express';

import ListingController from './listings.controller';
import listingValidation from './listings.validator';
import { validate, authenticateSignature } from '../middlewares';
import { catchAsync } from '../utils';

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
