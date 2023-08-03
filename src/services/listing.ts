import { Listing, Prisma } from '@prisma/client';

import { ListingDBFilters } from '../interfaces';
import prisma from '../prisma/index';

class ListingService {
	model = prisma.listing;

	async count(): Promise<number> {
		return prisma.listing.count();
	}

	async all(filters: ListingDBFilters): Promise<Listing[]> {
		return this.model.findMany({
			take: filters.limit,
			skip: filters.offset,
			where: {
				AND: [
					{ status: filters.status },
					{ creatorAddr: filters.creator },
					{ createdAt: { lte: filters.listedAfter } },
					{ createdAt: { gte: filters.listedBefore } },
				],
			},
		});
	}

	async getByTokenId(tokenId: string): Promise<Listing[] | null> {
		return this.model.findMany({
			where: {
				nftId: tokenId,
			},
		});
	}

	async getById(id: string): Promise<Listing | null> {
		return this.model.findUnique({
			where: {
				id: id,
			},
		});
	}

	async create(data: Prisma.ListingCreateInput): Promise<Listing> {
		return this.model.create({ data: data });
	}

	async update(id: string, updateData: Prisma.ListingUpdateInput): Promise<Listing> {
		return this.model.update({ where: { id: id }, data: updateData });
	}

	async cancelListing(id: string, txHash: string): Promise<Listing> {
		return this.update(id, { status: 'CANCELLED', updateTxnHash: txHash });
	}
}

export default new ListingService();
