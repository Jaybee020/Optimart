import { Auction, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class AuctionService {
	auctionModel = prisma.auction;

	count(): Promise<number> {
		return this.auctionModel.count();
	}

	all(limit: number = 100, offset: number = 0): Promise<Auction[]> {
		return this.auctionModel.findMany({
			take: limit,
			skip: offset,
		});
	}

	getByTokenId(tokenId: string): Promise<Auction[] | null> {
		return this.auctionModel.findMany({
			where: {
				nftId: tokenId,
			},
		});
	}

	create(data: Prisma.AuctionCreateInput): Promise<Auction> {
		return this.auctionModel.create({ data: data });
	}

	update(id: string, updateData: Prisma.AuctionUpdateInput): Promise<Auction> {
		return this.auctionModel.update({ where: { id: id }, data: updateData });
	}
}

export default new AuctionService();
