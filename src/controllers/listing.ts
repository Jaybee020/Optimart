import { Listing } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { ListingDBFilters } from '../interfaces';
import { ListingService } from '../services';
import { XrplClient, assert, pick, NFTBroker } from '../utils';

class ListingController {
	async getListingById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const listing = await ListingService.getById(id as string);
		res.status(httpStatus.OK).json({ data: listing });
	}

	async getListings(req: Request, res: Response): Promise<void> {
		const filters = pick(req.query, [
			'status',
			'limit',
			'offset',
			'creator',
			'listedBefore',
			'listedAfter',
		]) as ListingDBFilters;
		const listings: Listing[] = await ListingService.all(filters);
		res.status(httpStatus.OK).json({ data: listings });
	}

	async createListing(req: Request, res: Response): Promise<void> {
		const { txHash, extraPayload } = req.body;
		const { type } = extraPayload;

		const listing = await NFTBroker.createListing(txHash, type, req.user?.address);
		res.status(httpStatus.OK).json({ data: listing });

		// todo: consider updating floor price of collection depending on listing price
	}

	async cancelListing(req: Request, res: Response): Promise<void> {
		const { txHash, extraPayload } = req.body;
		const { listingId } = extraPayload;
		const listing = await ListingService.getById(listingId);

		assert(listing != null, 'Listing not found in database');
		assert(listing?.creatorAddr == req.user?.address, 'Listing creator mismatch with authenticated user');
		assert(listing?.status == 'ONGOING', 'Listing must be currently ongoing');

		const txn = (await XrplClient.getTransaction(txHash)).result;

		assert(txn.TransactionType == 'NFTokenCancelOffer', "Transaction provided is of wrong type'");
		assert(txn.Account == req.user?.address, 'Not authorised');

		await NFTBroker.cancelListing(listingId, txHash);
		res.status(httpStatus.NO_CONTENT).json();
	}
}

export default new ListingController();
