import { Listing } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { NFTokenCancelOffer, NFTokenCreateOffer } from 'xrpl';

import configuration from '../config/config';
import { ListingDBFilters } from '../interfaces';
import ListingService from '../services/listing';
import TokenService from '../services/token';
import { XrplClient } from '../utils';
import { assert } from '../utils/misc';
import pick from '../utils/pick';

export async function getListingById(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const listing = await ListingService.getById(id as string);
	res.status(httpStatus.OK).json({ data: listing });
}

export async function getListings(req: Request, res: Response): Promise<void> {
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

export async function createListing(req: Request, res: Response): Promise<void> {
	const { txHash } = req.body;
	const tx = (await XrplClient.getTransaction(txHash)) as NFTokenCreateOffer;

	assert(tx.Account == req.user?.address, 'Not authorised');
	assert(tx.Flags == 1, 'Offer type in transaction is not of right type');
	assert(tx.TransactionType == 'NFTokenCreateOffer', "Transaction provided is of wrong type'");
	assert(
		tx.Destination == XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
		'Transaction destination address does not belong to Optimart',
	);

	const ongoingListings = await ListingService.all({ status: 'ONGOING' });
	assert(
		ongoingListings.length == 0,
		'A listing for this token is still ongoing, cancel/close it before creating a new one',
	);

	const nft = await TokenService.getOrCreateByTokenId(tx.NFTokenID);
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

export async function cancelListing(req: Request, res: Response): Promise<void> {
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
