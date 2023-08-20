import { Listing, ListingOffer, ListingType } from '@prisma/client';
import { TransactionMetadata, rippleTimeToUnixTime, xrpToDrops } from 'xrpl';

import { assert } from './misc';
import { configuration } from '../config';
import { NFTCreateOfferWithId } from '../interfaces';
import { ListingOfferService, ListingService, TokenService } from '../services';

import { XrplClient } from '.';

class NFTBroker {
	/**
	 * Brokers a nft sale between a buyer and sell with the specified offerId.
	 *
	 * @param offerId the offerId to accept.
	 */
	async acceptListingOffer(offerId: string): Promise<void> {
		const offer = (await ListingOfferService.getById(offerId)) as ListingOffer;
		assert(offer != null, 'No offer of corresponding Id was found');
		const listing = (await ListingService.getById(offer.listingId as string)) as Listing; // make listing compulsory

		//select losing offers
		const losingOffers = (await ListingOfferService.getByListing(listing.id))
			.filter((offerData) => offerData.id != offerId) //remove current winning offers
			.map((offerData) => ({
				id: offerData.id,
				buyOfferId: offerData.buyOfferId,
			}));

		const fee =
			(7.5 / 100) * Number(listing.price) > Number(xrpToDrops(25))
				? Number(xrpToDrops(25))
				: (70 / 100) * Number(listing.price);

		//broker transaction
		const acceptTxn = XrplClient.acceptOfferForNFTokens(
			XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
			offer.buyOfferId,
			listing.sellOfferId,
			fee.toString(),
		);

		//cancel losing offers
		const cancelTxn = XrplClient.cancelOfferForNFTokens(
			XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
			losingOffers.map((losingOffer) => losingOffer.buyOfferId),
		);

		// submit transaction
		const [acceptTxnResponse, rejectTxnResponse] = await XrplClient.signAndSubmitTransactions([
			acceptTxn,
			cancelTxn,
		]);

		await ListingOfferService.accept(offerId, acceptTxnResponse.hash); //update winning offer in db

		//update losing offers in db
		await Promise.all(
			losingOffers
				.map((losingOffer) => losingOffer.id)
				.map((id) => {
					ListingOfferService.reject(id, rejectTxnResponse.hash);
				}),
		);

		await ListingService.completeListing(listing.id, acceptTxnResponse.hash);
	}

	/**
	 * It selects the winning bid(if any) for the specified auction and brokers the sale.
	 *
	 * @param auctionId the id of the auction to complete
	 */
	async completeAuction(auctionId: string): Promise<void> {
		const auction = (await ListingService.getById(auctionId)) as Listing; // make listing compulsory
		assert(auction != null, 'Auction id does not exist');
		const bids = await ListingOfferService.getByListing(auctionId);
		///select winning bid by price
		const winningBid = bids.reduce((prevBid, currentBid) =>
			Number(prevBid.amount) > Number(currentBid.amount) ? prevBid : currentBid,
		);

		if (winningBid.amount.toNumber() > auction.price.toNumber()) {
			await this.acceptListingOffer(winningBid.id);
		} else {
			await this.cancelListing(auctionId);
		}
	}

	/**
	 * Creates a new listing
	 *
	 * @param txHash the transaction hash of the NFTokenCreate Offer on the XRP blockchain
	 * @param type the type of the listing(REGULAR OR AUCTION)
	 * @param creator the account creating the listing
	 */
	async createListing(txHash: string, type: ListingType, creator: string | undefined): Promise<Listing> {
		const tx = (await XrplClient.getTransaction(txHash)).result;
		const nftOffer = XrplClient.parseNFTCreateOfferFromTxnMetadata(
			tx.meta as TransactionMetadata,
		) as NFTCreateOfferWithId;
		const endAt = nftOffer.Expiration ? rippleTimeToUnixTime(nftOffer.Expiration) : undefined;

		assert(type == 'REGULAR' || type == 'AUCTION', 'Invalid listing type input');
		assert(tx.Account == creator, 'Not authorised');
		assert(nftOffer.Flags == 1, 'Offer type in transaction is not of right type');
		assert(nftOffer.TransactionType == 'NFTokenCreateOffer', "Transaction provided is of wrong type'");
		assert(
			nftOffer.Destination == XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
			'Transaction destination address does not belong to Optimart',
		);
		if (type == 'AUCTION') {
			assert(endAt != undefined, 'Auction types must have an expiration time');
		}
		if (endAt) {
			assert(endAt > Date.now(), 'Invalid value for ending timestamp');
		}

		const nft = await TokenService.getOrCreateByTokenId(nftOffer.NFTokenID);
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
			price: Number(nftOffer.Amount),
			endAt: endAt ? new Date(endAt) : undefined,
			type: type,
			nft: {
				connect: {
					tokenId: nft.tokenId,
				},
			},
			createTxnHash: txHash,
			sellOfferId: nftOffer.id,
		});
		return listing;
	}

	/**
	 * It cancels a listing and all offers associated with it
	 *
	 * @param listingId the id of the auction to complete
	 * @param txHash the hash of the NFTokenOffer cancel transaction
	 */

	async cancelListing(listingId: string, txHash?: string): Promise<void> {
		const offers = await ListingOfferService.getByListing(listingId);
		const listing = (await ListingService.getById(listingId)) as Listing;
		if (offers.length > 0) {
			const cancelTxn = XrplClient.cancelOfferForNFTokens(
				XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
				offers.map((offer) => offer.buyOfferId),
			);

			const [rejectTxnResponse] = await XrplClient.signAndSubmitTransactions([cancelTxn]);

			await Promise.all(
				offers
					.map((losingOffer) => losingOffer.id)
					.map((id) => {
						ListingOfferService.reject(id, rejectTxnResponse.hash);
					}),
			);
		}
		if (!txHash) {
			assert(listing != null, 'Listing id does not exist');
			const cancelTxn = XrplClient.cancelOfferForNFTokens(
				XrplClient.getAddressFromPrivateKey(configuration.XRPL_ACCOUNT_SECRET),
				[listing.sellOfferId],
			);
			txHash = (await XrplClient.signAndSubmitTransactions([cancelTxn]))[0].hash;
		}
		if (listing.endAt && listing.endAt.getTime() > Date.now()) {
			await ListingService.completeListing(listingId, txHash);
		} else {
			await ListingService.cancelListing(listingId, txHash);
		}
	}

	async completePendingListings(): Promise<void> {
		const pendingListings = await ListingService.getPendingListings();
		await Promise.all(
			pendingListings.map(async (listing) => {
				if (listing.type == 'AUCTION') {
					await this.completeAuction(listing.id);
				} else {
					await this.cancelListing(listing.id);
				}
			}),
		);
	}
}

export default new NFTBroker();
