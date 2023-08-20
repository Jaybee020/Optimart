import { ListingOffer, Prisma } from '@prisma/client';

import { OfferDBFilters } from '../interfaces';
import prisma from '../prisma/index';

class ListingOfferService {
	model = prisma.listingOffer;

	async getById(id: string): Promise<ListingOffer | null> {
		return this.model.findUnique({ where: { id: id } });
	}

	async count(filters: OfferDBFilters): Promise<number> {
		return this.model.count({
			where: {
				AND: [
					{ offereeAddr: filters.offeree },
					{ offerorAddr: filters.offeror },
					{ createdAt: { lte: filters.offeredAfter } },
					{ createdAt: { gte: filters.offeredBefore } },
					{ listingId: filters.listing },
					{ status: filters.status },
				],
			},
		});
	}

	async all(filters: OfferDBFilters): Promise<ListingOffer[]> {
		return this.model.findMany({
			take: filters.limit,
			skip: filters.offset,

			where: {
				AND: [
					{ offereeAddr: filters.offeree },
					{ offerorAddr: filters.offeror },
					{ createdAt: { lte: filters.offeredAfter } },
					{ createdAt: { gte: filters.offeredBefore } },
					{ listingId: filters.listing },
					{ status: filters.status },
					{ nftId: filters.nftId },
				],
			},
		});
	}

	async getByListing(listingId: string): Promise<ListingOffer[]> {
		return this.model.findMany({
			where: {
				listingId: listingId,
			},
		});
	}

	async create(data: Prisma.ListingOfferCreateInput): Promise<ListingOffer> {
		return this.model.create({ data: data });
	}

	async update(id: string, data: Prisma.ListingOfferUpdateInput): Promise<ListingOffer> {
		return this.model.update({ where: { id: id }, data: data });
	}

	async cancel(id: string, txHash: string): Promise<ListingOffer> {
		return this.update(id, { status: 'CANCELLED', updateTxnHash: txHash });
	}

	async accept(id: string, txHash: string): Promise<ListingOffer> {
		return this.update(id, { status: 'ACCEPTED', updateTxnHash: txHash });
	}

	async reject(id: string, txHash: string): Promise<ListingOffer> {
		return this.update(id, { status: 'REJECTED', updateTxnHash: txHash });
	}
}

export default new ListingOfferService();
