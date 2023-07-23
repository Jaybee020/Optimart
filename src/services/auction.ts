import { Auction, Prisma } from '@prisma/client';

import prisma from '../prisma/index';

class AuctionService {
	auctionCollection;
	constructor() {
		this.auctionCollection = prisma.auction;
	}

	getCount(): Promise<number> {
		return this.auctionCollection.count();
	}

	getAuctions(limit: number = 100, offset: number = 0): Promise<Auction[]> {
		return this.auctionCollection.findMany({
			take: limit,
			skip: offset,
		});
	}

	getByTokenId(tokenId: string): Promise<Auction | null> {
		return this.auctionCollection.findUnique({
			where: {
				nftId: tokenId,
			},
		});
	}

	create(data: Prisma.AuctionCreateInput): Promise<Auction> {
		return this.auctionCollection.create({ data: data });
	}

	update(id: string, updateData: Prisma.AuctionUpdateInput): Promise<Auction> {
		return this.auctionCollection.update({ where: { id: id }, data: updateData });
	}

	delete(id: string): Promise<Auction | null> {
		return this.auctionCollection.delete({
			where: {
				id: id,
			},
		});
	}
}

export default new AuctionService();
