import { Listing, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class ListingService {
	listingModel;
	constructor() {
		this.listingModel = prisma.listing;
	}

	getCount(): Promise<number> {
		return this.listingModel.count();
	}

	getListings(limit: number = 100, offset: number = 0): Promise<Listing[]> {
		return this.listingModel.findMany({
			take: limit,
			skip: offset,
		});
	}

	getByTokenId(tokenId: string): Promise<Listing | null> {
		return this.listingModel.findUnique({
			where: {
				nftId: tokenId,
			},
		});
	}

	create(data: Prisma.ListingCreateInput): Promise<Listing> {
		return this.listingModel.create({ data: data });
	}

	update(id: string, updateData: Prisma.ListingUpdateInput): Promise<Listing> {
		return this.listingModel.update({ where: { id: id }, data: updateData });
	}

	delete(id: string): Promise<Listing | null> {
		return this.listingModel.delete({
			where: {
				id: id,
			},
		});
	}
}

export default new ListingService();
