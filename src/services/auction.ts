import { Auction, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class AuctionService {
	model = prisma.auction;

	async count(): Promise<number> {
		return this.model.count();
	}

	async all(limit: number, offset: number): Promise<Auction[]> {
		return this.model.findMany({
			take: limit,
			skip: offset,
		});
	}

	async getByTokenId(tokenId: string): Promise<Auction[] | null> {
		return this.model.findMany({
			where: {
				nftId: tokenId,
			},
		});
	}

	async create(data: Prisma.AuctionCreateInput): Promise<Auction> {
		return this.model.create({ data: data });
	}

	async update(id: string, updateData: Prisma.AuctionUpdateInput): Promise<Auction> {
		return this.model.update({ where: { id: id }, data: updateData });
	}
}

export default new AuctionService();
