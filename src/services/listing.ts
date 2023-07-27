import { Listing, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class ListingService {
	listingModel = prisma.listing;

	count(): Promise<number> {
		return this.listingModel.count();
	}

	all(limit: number = 100, offset: number = 0): Promise<Listing[]> {
		return this.listingModel.findMany({
			take: limit,
			skip: offset,
		});
	}

	getByTokenId(tokenId: string): Promise<Listing[] | null> {
		return this.listingModel.findMany({
			where: {
				nftId: tokenId,
			},
		});
	}

	getById(id: string): Promise<Listing | null> {
		return this.listingModel.findUnique({
			where: {
				id: id,
			},
		});
	}

	create(data: Prisma.ListingCreateInput): Promise<Listing> {
		return this.listingModel.create({ data: data });
	}

	update(id: string, updateData: Prisma.ListingUpdateInput): Promise<Listing> {
		return this.listingModel.update({ where: { id: id }, data: updateData });
	}

	cancelListing(id: string, txHash: string): Promise<Listing> {
		return this.update(id, { status: 'CANCELLED', updateTxnHash: txHash });
	}
}

export default new ListingService();
