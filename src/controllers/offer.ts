import { ListingOffer } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { NFTokenCancelOffer, NFTokenCreateOffer, rippleTimeToUnixTime } from 'xrpl';

import { configuration } from '../config';
import { OfferDBFilters } from '../interfaces';
import { ListingOfferService, ListingService, OfferService, TokenService } from '../services';
import { XrplClient, assert, pick } from '../utils';

class OfferController {
	async getOfferById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const offer = await ListingOfferService.getById(id);
		res.status(httpStatus.OK).json({ data: offer });
	}

	async getOffers(req: Request, res: Response): Promise<void> {
		const filters = pick(req.query, [
			'status',
			'limit',
			'offset',
			'offeree',
			'offeror',
			'listing',
			'offeredBefore',
			'offeredAfter',
		]) as OfferDBFilters;

		const offers: ListingOffer[] = await ListingOfferService.all(filters);
		const offersCount = await ListingOfferService.count(filters);
		res.status(httpStatus.OK).json({
			data: {
				total: offersCount,
				offers: offers,
			},
		});
	}

	async createOffers(req: Request, res: Response): Promise<void> {
		const { txHash, extraPayload } = req.body;
		const { listingId } = extraPayload;
		const tx = (await XrplClient.getTransaction(txHash)) as NFTokenCreateOffer;

		assert(tx.Account == req.user?.address, 'Not authorised');
		assert(tx.Flags == 0, 'Offer type in transaction is not of right type');
		assert(tx.TransactionType == 'NFTokenCreateOffer', "Transaction provided is of wrong type'");
		assert(
			tx.Destination == XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
			'Transaction destination address does not belong to Optimart',
		);

		const nft = await TokenService.getOrCreateByTokenId(tx.NFTokenID);
		const duration = tx.Expiration != undefined ? Date.now() - rippleTimeToUnixTime(tx.Expiration) : null;
		if (listingId) {
			const listing = await ListingService.getById(listingId);
			assert(listing != null && listing.status == 'ONGOING', 'Invalid listing id provided');
		}
		if (duration) {
			assert(duration > 0, 'Invalid duration for listing');
		}

		const offer = await ListingOfferService.create({
			createTxnHash: txHash,
			amount: Number(tx.Amount),
			nft: {
				connect: {
					tokenId: nft.tokenId,
				},
			},
			offeree: {
				connectOrCreate: {
					where: {
						address: tx.Owner,
					},
					create: {
						address: tx.Owner as string,
					},
				},
			},
			duration: duration,
			listing: {
				connect: { id: listingId },
			},
			offeror: {
				connectOrCreate: {
					where: {
						address: tx.Account,
					},
					create: {
						address: tx.Account as string,
					},
				},
			},
		});
		res.status(httpStatus.OK).json({ data: offer });
	}

	async cancelOffers(req: Request, res: Response): Promise<void> {
		const { txHash, extraPayload } = req.body;
		const { offerId } = extraPayload;
		const offer = await ListingOfferService.getById(offerId);

		assert(offer != null, 'Offer not found in database');
		assert(offer?.status == 'PENDING', 'Offer must be currently pending');
		assert(
			offer?.offereeAddr == req.user?.address || offer?.offerorAddr == req.user?.address,
			'Offers can only be cancelled by creator or acceptor ',
		);

		const txn = (await XrplClient.getTransaction(txHash)) as NFTokenCancelOffer;

		assert(txn.TransactionType == 'NFTokenCancelOffer', "Transaction provided is of wrong type'");
		assert(txn.Account == req.user?.address, 'Not authorised');
		res.status(httpStatus.NO_CONTENT).json();
	}
}
