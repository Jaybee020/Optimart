import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { NFTokenCancelOffer, NFTokenCreateOffer } from 'xrpl';

import configuration from '../config/config';
import ListingService from '../services/listing';
import TokenService from '../services/token';
import { XrplClient } from '../utils';
import { assert } from '../utils/misc';

class ListingController {
	async getListing(req: Request, res: Response): Promise<void> {
		try {
			const id = req.params.id;
			const listing = await ListingService.getById(id);
			res.status(httpStatus.OK).json({ data: listing });
		} catch (error) {
			res.status(httpStatus.BAD_REQUEST).json({ error });
		}
	}

	async getListings(req: Request, res: Response): Promise<void> {
		try {
			const { status, limit, offset, creator, listedAfter, listedBefore, tokenIds } =
				req.query;
			const listings: any[] = [];
			res.status(httpStatus.OK).json({ data: listings });
		} catch (error) {
			res.status(httpStatus.BAD_REQUEST).json({ error });
		}
	}

	//make sure user owns the token
	//make sure the amount is valid
	//create listing on chain

	async createListing(req: Request, res: Response): Promise<void> {
		try {
			const { txHash } = req.body;
			const txn = (await XrplClient.getTransaction(txHash)) as NFTokenCreateOffer;
			assert(
				txn.TransactionType == 'NFTokenCreateOffer',
				"Transaction provided is of wrong type'",
			);
			assert(txn.Destination == configuration.XRPL_ACCOUNT_ADDRESS);
			assert(txn.Account == req.user?.address, 'Not authorised');
			assert(txn.Flags == 1, 'Offer type in transaction is not of right type');
			//wanted to make sure there is currenlty no ongoing listing for the token or add isListed field to tokenSchema
			// const existingListings = await ListingService.getByTokenId(txn.NFTokenID);
			// assert(
			// 	existingListings == null ||
			// 		existingListings?.filter((tx) => tx.status == 'ONGOING').length == 0,
			// 	'There is a current listing for the specified token. Cancel or Close the listing ',
			// );
			const nft = await TokenService.getOrCreateByTokenId(txn.NFTokenID);
			//thinking of adding txn hash and offerId to db to ease cancelling of offers on frontend
			const listing = await ListingService.create({
				creator: {
					connectOrCreate: {
						where: {
							address: txn.Account,
						},
						create: {
							address: txn.Account,
						},
					},
				},
				price: Number(txn.Amount),
				nft: {
					connect: {
						tokenId: nft.tokenId,
					},
				},
				createTxnHash: txHash,
			});
			res.status(httpStatus.OK).json({ data: listing });
			//might probably update floor price of collection depending on listing price
		} catch (error) {
			res.status(httpStatus.BAD_REQUEST).json({ error });
		}
	}

	async cancelListing(req: Request, res: Response): Promise<void> {
		try {
			const { txHash, extras } = req.body;
			const { listingId } = extras;
			const listing = await ListingService.getById(listingId);
			assert(
				listing != null &&
					listing.creatorAddr == req.user?.address &&
					listing.status == 'ONGOING',
				'Error with listing provided',
			);
			const txn = (await XrplClient.getTransaction(txHash)) as NFTokenCancelOffer;
			assert(
				txn.TransactionType == 'NFTokenCancelOffer',
				"Transaction provided is of wrong type'",
			);
			assert(txn.Account == req.user?.address, 'Not authorised');
			await ListingService.cancelListing(listingId, txHash);
		} catch (error) {
			res.status(httpStatus.BAD_REQUEST).json({ error });
		}
	}
}

export default new ListingController();
