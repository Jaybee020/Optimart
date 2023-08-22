import { ListingOffer } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { TransactionMetadata, rippleTimeToUnixTime } from 'xrpl';

import { configuration } from '../config';
import { NFTCreateOfferWithId, OfferDBFilters } from '../interfaces';
import { ListingOfferService, ListingService, TokenService } from '../services';
import { NFTBroker, XrplClient, assert, pick } from '../utils';

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
			'nftId',
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
		const tx = (await XrplClient.getTransaction(txHash)).result;
		const nftOffer = XrplClient.parseNFTCreateOfferFromTxnMetadata(
			tx.meta as TransactionMetadata,
		) as NFTCreateOfferWithId;
		const endAt = nftOffer.Expiration ? rippleTimeToUnixTime(nftOffer.Expiration) : undefined;
		if (endAt) {
			assert(endAt > Date.now(), 'Invalid value for ending timestamp');
		}
		assert(tx.Account == req.user?.address, 'Not authorised');
		assert(nftOffer.Flags != 1, 'Offer type in transaction is not of right type');
		assert(tx.TransactionType == 'NFTokenCreateOffer', "Transaction provided is of wrong type'");
		assert(
			nftOffer.Destination == XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
			'Transaction destination address does not belong to Optimart',
		);

		const nft = await TokenService.getOrCreateByTokenId(nftOffer.NFTokenID);
		let listing;
		if (listingId) {
			listing = await ListingService.getById(listingId);
			assert(listing != null && listing.status == 'ONGOING', 'Invalid listing id provided');
		}

		const offer = await ListingOfferService.create({
			createTxnHash: txHash,
			amount: Number(nftOffer.Amount),
			nft: {
				connect: {
					tokenId: nft.tokenId,
				},
			},
			offeree: {
				connectOrCreate: {
					where: {
						address: nftOffer.Owner,
					},
					create: {
						address: nftOffer.Owner as string,
					},
				},
			},
			endAt: endAt ? new Date(endAt) : undefined,
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
			buyOfferId: nftOffer.id,
		});

		if (listing && listing.price.toNumber() <= offer.amount.toNumber()) {
			await NFTBroker.acceptListingOffer(offer.id);
		}
		res.status(httpStatus.OK).json({ data: offer });
	}

	async cancelOffer(req: Request, res: Response): Promise<void> {
		const { txHash, extraPayload } = req.body;
		const { offerId } = extraPayload;
		const offer = await ListingOfferService.getById(offerId);

		assert(offer != null, 'Offer not found in database');
		assert(offer?.status == 'PENDING', 'Offer must be currently pending');
		assert(offer?.offerorAddr == req.user?.address, 'Offers can only be cancelled by creator');

		const txn = (await XrplClient.getTransaction(txHash)).result;

		assert(txn.TransactionType == 'NFTokenCancelOffer', "Transaction provided is of wrong type'");
		assert(txn.Account == req.user?.address, 'Not authorised');
		await ListingOfferService.cancel(offerId, txHash);
		res.status(httpStatus.NO_CONTENT).json();
	}

	async rejectOffer(req: Request, res: Response): Promise<void> {
		const { txHash, extraPayload } = req.body;
		const { offerId } = extraPayload;
		const offer = await ListingOfferService.getById(offerId);

		assert(offer != null, 'Offer not found in database');
		assert(offer?.status == 'PENDING', 'Offer must be currently pending');
		assert(offer?.offereeAddr == req.user?.address, 'Offers can only be rejected by receiver');

		const txn = (await XrplClient.getTransaction(txHash)).result;

		assert(txn.TransactionType == 'NFTokenCancelOffer', "Transaction provided is of wrong type'");
		assert(txn.Account == req.user?.address, 'Not authorised');

		await ListingOfferService.reject(offerId, txHash);
		res.status(httpStatus.NO_CONTENT).json();
	}

	async acceptOffer(req: Request, res: Response): Promise<void> {
		const { txHash, extraPayload } = req.body;
		const { offerId } = extraPayload;
		const offer = await ListingOfferService.getById(offerId);

		assert(offer != null, 'Offer not found in database');
		assert(offer?.status == 'PENDING', 'Offer must be currently pending');
		assert(offer?.offereeAddr == req.user?.address, 'Offers can only be rejected by receiver');

		if (!offer?.listingId) {
			assert(txHash != undefined, '');
			const listing = await NFTBroker.createListing(txHash, 'REGULAR', req.user?.address);
			await ListingOfferService.update(offerId, {
				listing: {
					connect: {
						id: listing.id,
					},
				},
			});
		}
		await NFTBroker.acceptListingOffer(offerId);
		res.status(httpStatus.NO_CONTENT).json();
	}
}

export default new OfferController();
