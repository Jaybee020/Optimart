import { Router } from 'express';

import { getListingById, getListings, createListing, cancelListing } from '../controllers/listing';
import { authenticateSignature } from '../middlewares/auth';
import validate from '../middlewares/validate';
import catchAsync from '../utils/catch-async';
import listingValidation from '../validators/listing';

const listingRouter = Router();

listingRouter
	.get('/', validate(listingValidation.getAll), catchAsync(getListings))
	.post('/', authenticateSignature, validate(listingValidation.create), catchAsync(createListing));

listingRouter
	.get('/:id', validate(listingValidation.getById), catchAsync(getListingById))
	.delete('/:id', authenticateSignature, validate(listingValidation.cancel), catchAsync(cancelListing));

export default listingRouter;
