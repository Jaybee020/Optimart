import { Listing } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { NFTokenCancelOffer, NFTokenCreateOffer, rippleTimeToUnixTime } from 'xrpl';

import { configuration } from '../config';
import { ListingDBFilters } from '../interfaces';
import { ListingService, TokenService } from '../services';
import { XrplClient, assert, pick } from '../utils';

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
		const tx = (await XrplClient.getTransaction(txHash)) as NFTokenCreateOffer;
		const endAt = tx.Expiration ? rippleTimeToUnixTime(tx.Expiration) : undefined;

		assert(type == 'REGULAR' || type == 'AUCTION', 'Invalid listing type input');
		assert(tx.Account == req.user?.address, 'Not authorised');
		assert(tx.Flags == 1, 'Offer type in transaction is not of right type');
		assert(tx.TransactionType == 'NFTokenCreateOffer', "Transaction provided is of wrong type'");
		assert(
			tx.Destination == XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
			'Transaction destination address does not belong to Optimart',
		);
		if (type == 'AUCTION') {
			assert(endAt != undefined, 'Auction types must have an expiration time');
		}
		if (endAt) {
			assert(endAt > Date.now(), 'Invalid value for ending timestamp');
		}

		const nft = await TokenService.getOrCreateByTokenId(tx.NFTokenID);
		const ongoingListings = await ListingService.all({ status: 'ONGOING', nftId: nft.tokenId });

		assert(
			ongoingListings.length == 0,
			'A listing for this token is still ongoing, cancel/close it before creating a new one',
		);

		const listing = await ListingService.create({
			creator: {
				connectOrCreate: {
					where: {
						address: tx.Account,
					},
					create: {
						address: tx.Account,
					},
				},
			},
			price: Number(tx.Amount),
			endAt: endAt ? new Date(endAt) : undefined,
			type: type,
			nft: {
				connect: {
					tokenId: nft.tokenId,
				},
			},
			createTxnHash: txHash,
		});
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

		const txn = (await XrplClient.getTransaction(txHash)) as NFTokenCancelOffer;

		assert(txn.TransactionType == 'NFTokenCancelOffer', "Transaction provided is of wrong type'");
		assert(txn.Account == req.user?.address, 'Not authorised');

		await ListingService.cancelListing(listingId, txHash);
		res.status(httpStatus.NO_CONTENT).json();
	}
}

export default new ListingController();
